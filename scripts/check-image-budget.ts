/**
 * Flag published listings whose gallery exceeds the image-count budget.
 * Run: pnpm check:images
 *
 * Budget is count-based (remote byte sizes need per-URL HEAD).
 * Soft-fail by default (exit 0); pass --strict to exit 1 on violations.
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const MAX_IMAGES = Number(process.env.LISTING_IMAGE_BUDGET || 12)
const strict = process.argv.includes('--strict')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL + key).')
    process.exit(1)
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await sb
    .from('listings')
    .select('id, slug, title, status, listing_images ( id )')
    .eq('status', 'published')

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(1)
  }

  const rows = data || []
  const over = rows
    .map((r) => {
      const images = Array.isArray(r.listing_images) ? r.listing_images : []
      return {
        slug: r.slug as string,
        title: (r.title as string) || r.slug,
        count: images.length,
      }
    })
    .filter((r) => r.count > MAX_IMAGES)
    .sort((a, b) => b.count - a.count)

  console.log(
    `Image budget: max ${MAX_IMAGES} images per published listing (${rows.length} checked).`,
  )

  if (over.length === 0) {
    console.log('OK — no listings over budget.')
    return
  }

  console.log(`\n${over.length} listing(s) over budget:\n`)
  for (const row of over) {
    console.log(`  ${row.count} images  /listings/${row.slug}/  — ${row.title}`)
  }
  console.log(
    '\nGuidance: compress/crop before upload; prefer ≤8 strong photos; avoid near-duplicates.',
  )

  if (strict) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
