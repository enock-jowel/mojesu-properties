/**
 * Property submission persistence interface + optional D1 adapter.
 * Production path uses Supabase via createSupabaseSubmissionsStore.
 * Missing store/d1 must fail closed in submitPropertySubmission — no console success path.
 */

import type { PropertySubmission } from './types'

export interface SubmissionsStore {
  insert(submission: PropertySubmission): Promise<void>
}

/** D1-shaped binding (Cloudflare Pages / optional). */
export interface D1DatabaseLike {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>
    }
  }
}

export function createD1Store(db: D1DatabaseLike): SubmissionsStore {
  return {
    async insert(submission) {
      await db
        .prepare(
          `INSERT INTO property_submission
            (id, listing_mode, category, location, rough_address,
             bedrooms, bathrooms, approx_plot_size, approx_floor_area,
             photos, asking_price, contact_name, contact_phone,
             best_time_to_reach, status, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          submission.id,
          submission.listingMode,
          submission.category,
          submission.location,
          submission.roughAddress,
          submission.bedrooms ?? null,
          submission.bathrooms ?? null,
          submission.approxPlotSize ?? null,
          submission.approxFloorArea ?? null,
          JSON.stringify(submission.photos ?? []),
          submission.askingPrice ?? null,
          submission.contactName,
          submission.contactPhone,
          submission.bestTimeToReach,
          submission.status,
          submission.submittedAt,
        )
        .run()
    },
  }
}

export const PROPERTY_SUBMISSION_SCHEMA_SQL = `
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
`
