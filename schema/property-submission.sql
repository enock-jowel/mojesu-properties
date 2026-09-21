-- D1 schema for propertySubmission intake (no public listing created).
-- Apply with: wrangler d1 execute mojesu-bookings --file=./schema/property-submission.sql

CREATE TABLE IF NOT EXISTS property_submission (
  id TEXT PRIMARY KEY,
  listing_mode TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  rough_address TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  approx_plot_size TEXT,
  approx_floor_area TEXT,
  photos TEXT NOT NULL DEFAULT '[]',
  asking_price REAL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  best_time_to_reach TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  submitted_at TEXT NOT NULL
);
