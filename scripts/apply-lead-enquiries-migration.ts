/**
 * Apply supabase/migrations/007_lead_enquiries.sql
 *
 * Preferred (no extra deps): paste the SQL into Supabase Dashboard → SQL Editor → Run.
 *
 * CLI (requires `psql` + DB URL from Dashboard → Database → Connection string):
 *   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/007_lead_enquiries.sql
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
const file = resolve(process.cwd(), 'supabase/migrations/007_lead_enquiries.sql')

if (!url) {
  console.error('Missing SUPABASE_DB_URL / DATABASE_URL.')
  console.error('Open supabase/migrations/007_lead_enquiries.sql in the SQL Editor instead.')
  process.exit(1)
}

const result = spawnSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-f', file], {
  encoding: 'utf8',
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
