'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireStaff, type ActionResult } from '@/lib/admin/auth'
import { getViewingContent } from '@/lib/site-content/queries'
import type {
  ListingAdminRef,
  PropertySubmissionRow,
  PropertySubmissionStatus,
  ViewingBookingRow,
  ViewingBookingStatus,
} from '@/lib/requests/types'

function revalidateRequests(id?: string) {
  revalidateTag('admin-dashboard')
  revalidatePath('/admin/requests/')
  revalidatePath('/admin/dashboard/')
  if (id) {
    revalidatePath(`/admin/requests/bookings/${id}/`)
    revalidatePath(`/admin/requests/submissions/${id}/`)
  }
}

export async function getAdminViewingBookings(): Promise<
  ActionResult<ViewingBookingRow[]>
> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const { data, error } = await gate.supabase
    .from('viewing_bookings')
    .select('*')
    .order('requested_at', { ascending: false })

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as ViewingBookingRow[] }
}

export async function getAdminViewingBooking(
  id: string,
): Promise<
  ActionResult<{ booking: ViewingBookingRow; listings: ListingAdminRef[] }>
> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const { data, error } = await gate.supabase
    .from('viewing_bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return { ok: false, error: error?.message || 'Not found' }

  const booking = data as ViewingBookingRow
  let listings: ListingAdminRef[] = []
  if (booking.listing_ids?.length) {
    const { data: rows } = await gate.supabase
      .from('listings')
      .select('id, slug, title, status')
      .in('id', booking.listing_ids)
    listings = (rows || []) as ListingAdminRef[]
  }

  return { ok: true, data: { booking, listings } }
}

export async function updateViewingBookingStatus(
  id: string,
  status: ViewingBookingStatus,
): Promise<ActionResult<ViewingBookingRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const allowed: ViewingBookingStatus[] = [
    'requested',
    'confirmed',
    'completed',
    'declined',
    'expired',
  ]
  if (!allowed.includes(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  const patch: Record<string, unknown> = { status }

  if (status === 'confirmed') {
    const viewing = await getViewingContent()
    const confirmedAt = new Date()
    const expiresAt = new Date(confirmedAt)
    expiresAt.setDate(expiresAt.getDate() + viewing.passDays)
    patch.confirmed_at = confirmedAt.toISOString()
    patch.expires_at = expiresAt.toISOString()
  }

  const { data, error } = await gate.supabase
    .from('viewing_bookings')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { ok: false, error: error?.message || 'Update failed' }
  revalidateRequests(id)
  return { ok: true, data: data as ViewingBookingRow }
}

export async function getAdminPropertySubmissions(): Promise<
  ActionResult<PropertySubmissionRow[]>
> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const { data, error } = await gate.supabase
    .from('property_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as PropertySubmissionRow[] }
}

export async function getAdminPropertySubmission(
  id: string,
): Promise<ActionResult<PropertySubmissionRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const { data, error } = await gate.supabase
    .from('property_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return { ok: false, error: error?.message || 'Not found' }
  return { ok: true, data: data as PropertySubmissionRow }
}

export async function updatePropertySubmissionStatus(
  id: string,
  status: PropertySubmissionStatus,
): Promise<ActionResult<PropertySubmissionRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }

  const allowed: PropertySubmissionStatus[] = [
    'new',
    'contacted',
    'visited',
    'listed',
    'declined',
  ]
  if (!allowed.includes(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  const { data, error } = await gate.supabase
    .from('property_submissions')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { ok: false, error: error?.message || 'Update failed' }
  revalidateRequests(id)
  return { ok: true, data: data as PropertySubmissionRow }
}
