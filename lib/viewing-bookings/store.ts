/**
 * Viewing booking persistence interface + optional D1 adapter.
 * Production path uses Supabase via createSupabaseBookingsStore.
 * Missing store/d1 must fail closed in submitViewingBooking — no console success path.
 */

import type { ViewingBooking } from './types'

export interface BookingsStore {
  insert(booking: ViewingBooking): Promise<void>
}

/** D1-shaped binding (Cloudflare Pages / optional). */
export interface D1DatabaseLike {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>
    }
  }
}

export function createD1Store(db: D1DatabaseLike): BookingsStore {
  return {
    async insert(booking) {
      await db
        .prepare(
          `INSERT INTO viewing_booking
            (id, listing_ids, preferred_date, contact_name, contact_phone, contact_email, status, requested_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          booking.id,
          JSON.stringify(booking.listingIds),
          booking.preferredDate,
          booking.contactName,
          booking.contactPhone,
          booking.contactEmail,
          booking.status,
          booking.requestedAt,
        )
        .run()
    },
  }
}

export const VIEWING_BOOKING_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS viewing_booking (
  id TEXT PRIMARY KEY,
  listing_ids TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  requested_at TEXT NOT NULL
);
`
