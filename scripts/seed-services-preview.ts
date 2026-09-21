/**
 * Upsert services only into hosted preview Supabase (.env.preview.local).
 * Does not touch agents/reviews/listings.
 *
 * Usage: node ./node_modules/tsx/dist/cli.mjs scripts/seed-services-preview.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { getSeedServices } from './seed-data/services-catalog'

config({ path: '.env.preview.local', override: true })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url.includes('supabase.co') || !key) {
    console.error('Need hosted preview env in .env.preview.local')
    process.exit(1)
  }

  console.log('Seeding services →', new URL(url).host)
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const services = getSeedServices()
  for (let i = 0; i < services.length; i++) {
    const s = services[i]
    const { error } = await supabase.from('services').upsert(
      {
        service_key: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        hero_description: s.heroDescription,
        image: s.image,
        image_alt: s.imageAlt,
        icon_class: s.iconClass,
        enquiry: s.enquiry,
        what_we_do: s.whatWeDo,
        offerings: s.offerings,
        process: s.process,
        status: 'published',
        sort_order: i,
      },
      { onConflict: 'slug' },
    )
    if (error) console.error(s.slug, error.message)
    else console.log('✓', s.slug)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
