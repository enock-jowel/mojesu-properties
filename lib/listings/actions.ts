'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireStaff, type ActionResult } from '@/lib/admin/auth'
import { assertCanPublish } from '@/lib/listing-validation'
import { slugifyTitle } from '@/lib/listings/map'
import type { ListingWriteInput, ListingRow } from '@/lib/listings/types'

export type { ActionResult }

function publishBlocked(input: ListingWriteInput): string | null {
  const gate = assertCanPublish(input.images)
  if (!gate.allowed) return gate.error

  const hasCover = input.images.some((i) => i.is_cover)
  if (!hasCover) return 'Select a cover photo before publishing.'

  if (input.listing_mode === 'sale' && !input.title_status) {
    return 'Title status is required for sale listings.'
  }

  if (!input.title.trim()) return 'Title is required.'
  if (!input.area.trim()) return 'Area is required.'

  if (input.category === 'land') {
    if (!input.plot_dimensions?.trim() && !input.plot_size_total?.trim()) {
      return 'Plot dimensions or total size is required for land.'
    }
    if (!input.title_status) return 'Title status is required for land.'
    if (!input.encumbrances?.trim()) {
      return 'Encumbrances is required (use “None known” if none).'
    }
  }

  if (input.category === 'house' || input.category === 'apartment') {
    if (input.bedrooms == null) return 'Bedrooms is required.'
    if (input.bathrooms == null) return 'Bathrooms is required.'
  }

  if (input.category === 'commercial' && input.floor_area == null && input.size_sqm == null) {
    return 'Floor area is required for commercial.'
  }

  return null
}

function toRow(
  input: ListingWriteInput,
  slug: string,
  userId: string,
  mode: 'insert' | 'update',
) {
  const base = {
    slug,
    listing_mode: input.listing_mode,
    category: input.category,
    status: input.status,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    area: input.area.trim(),
    area_tier: input.area_tier ?? null,
    address_internal: input.address_internal?.trim() || null,
    price: input.price ?? null,
    price_negotiable: Boolean(input.price_negotiable),
    currency: input.currency || 'UGX',
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    size_sqm: input.size_sqm ?? null,
    furnishing: input.furnishing ?? null,
    year_built: input.year_built ?? null,
    condition: input.condition ?? null,
    plot_dimensions: input.plot_dimensions ?? null,
    plot_size_total: input.plot_size_total ?? null,
    surveyed: input.surveyed ?? null,
    topography: input.topography ?? null,
    zoning: input.zoning ?? null,
    title_status: input.title_status ?? null,
    encumbrances:
      input.category === 'land'
        ? input.encumbrances?.trim() || 'None known'
        : input.encumbrances ?? null,
    floor_area: input.floor_area ?? null,
    unit_type: input.unit_type ?? null,
    floor_count: input.floor_count ?? null,
    layout: input.layout ?? null,
    power_capacity: input.power_capacity ?? null,
    deposit: input.deposit ?? null,
    deposit_refundable: input.deposit_refundable ?? null,
    min_lease_term: input.min_lease_term ?? null,
    included_utilities: input.included_utilities ?? null,
    pet_policy: input.pet_policy ?? null,
    available_from: input.available_from || null,
    service_charge: input.service_charge ?? null,
    escalation_clause: input.escalation_clause ?? null,
    occupancy_status: input.occupancy_status ?? null,
    highlights: (input.highlights ?? []).slice(0, 3),
    amenities: input.amenities ?? [],
    location_notes: input.location_notes ?? null,
    is_featured: Boolean(input.is_featured),
    updated_at: new Date().toISOString(),
    updated_by: userId,
  }

  if (mode === 'insert') {
    return { ...base, created_by: userId }
  }
  return base
}

async function replaceImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  images: ListingWriteInput['images'],
) {
  await supabase.from('listing_images').delete().eq('listing_id', listingId)
  if (!images.length) return null

  const rows = images.map((img, i) => ({
    listing_id: listingId,
    url: img.url,
    is_cover: Boolean(img.is_cover) || i === 0,
    room_tag: img.room_tag ?? null,
    sort_order: img.sort_order ?? i,
  }))

  const { error } = await supabase.from('listing_images').insert(rows)
  return error?.message ?? null
}

function revalidateListingPaths(slug: string) {
  revalidateTag('listings')
  revalidateTag('admin-dashboard')
  revalidatePath('/')
  revalidatePath('/buy/')
  revalidatePath('/rent/')
  revalidatePath('/land/')
  revalidatePath('/admin/listings/')
  revalidatePath('/admin/dashboard/')
  revalidatePath(`/listings/${slug}/`)
  revalidatePath('/sitemap.xml')
}

export async function saveListing(
  input: ListingWriteInput,
  listingId?: string,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) return { ok: false, error: gate.error || 'Unauthorized' }

  let status = input.status
  if (status === 'published') {
    const blocked = publishBlocked(input)
    if (blocked) return { ok: false, error: blocked }
  } else if (status !== 'archived') {
    status = 'draft'
  }

  const slugBase = input.slug?.trim() || slugifyTitle(input.title)
  if (!slugBase) return { ok: false, error: 'Could not build a slug from the title.' }

  if (listingId) {
    const row = toRow({ ...input, status }, slugBase, gate.user.id, 'update')
    const { data, error } = await gate.supabase
      .from('listings')
      .update(row)
      .eq('id', listingId)
      .select('id, slug')
      .single()

    if (error || !data) {
      return { ok: false, error: error?.message || 'Update failed' }
    }

    const imgErr = await replaceImages(gate.supabase, data.id, input.images)
    if (imgErr) return { ok: false, error: imgErr }

    revalidateListingPaths(data.slug)
    return { ok: true, data: { id: data.id, slug: data.slug } }
  }

  const row = toRow({ ...input, status }, slugBase, gate.user.id, 'insert')
  const { data, error } = await gate.supabase
    .from('listings')
    .insert(row)
    .select('id, slug')
    .single()

  if (error || !data) {
    if (error?.code === '23505') {
      return {
        ok: false,
        error: 'A listing with this slug already exists. Change the title slightly.',
      }
    }
    return { ok: false, error: error?.message || 'Create failed' }
  }

  const imgErr = await replaceImages(gate.supabase, data.id, input.images)
  if (imgErr) return { ok: false, error: imgErr }

  revalidateListingPaths(data.slug)
  return { ok: true, data: { id: data.id, slug: data.slug } }
}

export async function getAdminListings(): Promise<ActionResult<ListingRow[]>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const { data, error } = await gate.supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, listing_id, url, is_cover, room_tag, sort_order )
    `,
    )
    .order('updated_at', { ascending: false })

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as ListingRow[] }
}

export async function getAdminListing(
  id: string,
): Promise<ActionResult<ListingRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const { data, error } = await gate.supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, listing_id, url, is_cover, room_tag, sort_order )
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return { ok: false, error: error?.message || 'Not found' }
  return { ok: true, data: data as ListingRow }
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/admin/login/')
}
