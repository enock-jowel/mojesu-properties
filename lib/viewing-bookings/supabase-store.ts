import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookingsStore } from './store'
import type { ViewingBooking } from './types'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function resolveListingUuids(
  supabase: SupabaseClient,
  listingIds: string[],
  slugs: string[] = [],
): Promise<string[]> {
  const direct = listingIds.filter((id) => UUID_RE.test(id))
  const slugCandidates = [
    ...listingIds.filter((id) => !UUID_RE.test(id)),
    ...slugs,
  ].filter(Boolean)

  if (!slugCandidates.length) return [...new Set(direct)]

  const { data } = await supabase
    .from('listings')
    .select('id')
    .in('slug', slugCandidates)

  const fromSlug = ((data ?? []) as { id: string }[]).map((r) => r.id)
  return [...new Set([...direct, ...fromSlug])]
}

export function createSupabaseBookingsStore(
  supabase: SupabaseClient,
  options?: { preferredTime?: string | null; listingUuids?: string[] },
): BookingsStore {
  return {
    async insert(booking: ViewingBooking) {
      const listingIds =
        options?.listingUuids ??
        booking.listingIds.filter((id) => UUID_RE.test(id))

      const { error } = await supabase.from('viewing_bookings').insert({
        id: booking.id,
        listing_ids: listingIds,
        preferred_date: booking.preferredDate || null,
        preferred_time: options?.preferredTime ?? null,
        contact_name: booking.contactName,
        contact_phone: booking.contactPhone,
        contact_email: booking.contactEmail || null,
        status: booking.status || 'requested',
        requested_at: booking.requestedAt,
      })

      if (error) throw new Error(error.message)
    },
  }
}
