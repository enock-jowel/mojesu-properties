/**
 * Delete all rows from `listings` (listing_images cascade).
 * Targets hosted preview via .env.preview.local by default.
 *
 * Usage:
 *   pnpm exec tsx scripts/clear-listings.ts
 *   pnpm exec tsx scripts/clear-listings.ts --local   # use .env.local
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'node:path'

const useLocal = process.argv.includes('--local')
const envPath = path.resolve(
  __dirname,
  '..',
  useLocal ? '.env.local' : '.env.preview.local',
)

config({ path: envPath, override: true })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(`Missing Supabase env in ${envPath}`)
    process.exit(1)
  }
  if (!useLocal && !url.includes('supabase.co')) {
    console.error('Refusing: expected hosted Supabase URL in .env.preview.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { count: before, error: cErr } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
  if (cErr) throw cErr
  console.log(`Target: ${url}`)
  console.log(`Listings before: ${before ?? 0}`)

  const { error: dErr, count } = await supabase
    .from('listings')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (dErr) throw dErr
  console.log(`Deleted: ${count ?? 0}`)

  const { count: after, error: aErr } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
  if (aErr) throw aErr

  const { count: imgs } = await supabase
    .from('listing_images')
    .select('*', { count: 'exact', head: true })

  console.log(`Listings after: ${after ?? 0}`)
  console.log(`listing_images remaining: ${imgs ?? 0}`)

  if ((after ?? 0) > 0) {
    console.error('FAILED: listings still remain')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
