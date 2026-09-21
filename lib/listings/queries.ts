import { createClient as createBrowserSupabase } from '@supabase/supabase-js'
import { listingRowToProperty } from '@/lib/listings/map'
import type { ListingRow } from '@/lib/listings/types'
import type { Property } from '@/lib/properties'

const SELECT = `
  *,
  listing_images (
    id,
    listing_id,
    url,
    is_cover,
    room_tag,
    sort_order
  )
`

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createBrowserSupabase(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Published listings for the public site (anon RLS). Returns null if Supabase unset/unreachable. */
export async function fetchPublishedProperties(): Promise<Property[] | null> {
  const supabase = anonClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('listings')
    .select(SELECT)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error || !data) {
    console.warn('[listings] fetch published failed:', error?.message)
    return null
  }

  return (data as ListingRow[]).map(listingRowToProperty)
}

export async function fetchPublishedPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  const supabase = anonClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('listings')
    .select(SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) return null
  return listingRowToProperty(data as ListingRow)
}
