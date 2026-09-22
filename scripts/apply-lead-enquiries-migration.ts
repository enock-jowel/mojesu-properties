/**
 * Apply lead enquiry migrations (007 then 008).
 *
 * Preferred (no extra deps): paste each SQL file into Supabase Dashboard → SQL Editor → Run.
 *
 * CLI (requires `psql` + DB URL from Dashboard → Database → Connection string):
 *   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/007_lead_enquiries.sql
 *   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/008_lead_insert_service_role_only.sql
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
const files = [
  'supabase/migrations/007_lead_enquiries.sql',
  'supabase/migrations/008_lead_insert_service_role_only.sql',
]

if (!url) {
  console.error('Missing SUPABASE_DB_URL / DATABASE_URL.')
  console.error('Open the migration files in the SQL Editor instead:')
  for (const f of files) console.error(`  - ${f}`)
  process.exit(1)
}

for (const rel of files) {
  const file = resolve(process.cwd(), rel)
  console.log(`Applying ${rel}…`)
  const result = spawnSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-f', file], {
    encoding: 'utf8',
    stdio: 'inherit',
  })
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1)
}

console.log('Lead migrations applied.')
