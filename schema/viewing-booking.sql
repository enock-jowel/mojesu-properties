-- D1 schema for viewingBooking log (no admin UI yet).
-- Apply with: wrangler d1 execute mojesu-bookings --file=./schema/viewing-booking.sql

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
