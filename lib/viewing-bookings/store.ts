/**
 * viewingBooking persistence — log only, no admin UI.
 *
 * Prefer Cloudflare D1 when bound. Falls back to console log so submissions
 * never fail solely because storage isn't wired yet.
 */

import type { ViewingBooking } from './types'

export interface BookingsStore {
  insert(booking: ViewingBooking): Promise<void>
}

/** D1-shaped binding (Cloudflare Pages). */
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

/** Dev / unset storage — keeps the pipeline working without D1. */
export function createConsoleStore(): BookingsStore {
  return {
    async insert(booking) {
      console.info('[viewingBooking]', JSON.stringify(booking))
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
