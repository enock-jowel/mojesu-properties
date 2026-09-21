/**
 * One-time seed: load scripts/seed-data/properties-catalog into Supabase
 * `listings` + `listing_images`.
 *
 * Prerequisites:
 *   - Run supabase/migrations/001_cms_foundation.sql
 *   - Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   pnpm seed:listings
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { MIN_LISTING_IMAGES } from '../lib/listing-validation'
import {
  enrichListing,
  filterProperties,
  imageUrl,
  type Property,
} from '../lib/properties'
import { getSeedProperties } from './seed-data/properties-catalog'

config({ path: '.env.local' })

type CmsCategory = 'house' | 'apartment' | 'land' | 'commercial'
type CmsTitleStatus = 'freehold' | 'leasehold' | 'mailo' | 'customary'

function mapCategory(p: Property): CmsCategory {
  if (p.category === 'land') return 'land'
  if (p.useClass === 'commercial' || p.useClass === 'industrial') {
    return 'commercial'
  }
  if (p.useClass === 'mixed-use') return 'commercial'
  // residential kinds → apartment vs house
  const kind = 'kind' in p ? String(p.kind) : ''
  if (
    kind.includes('apartment') ||
    kind === 'bedsitter' ||
    kind === 'selfcontained' ||
    kind === 'studio'
  ) {
    return 'apartment'
  }
  return 'house'
}

function mapTitleStatus(raw?: string | null): CmsTitleStatus | null {
  if (!raw) return null
  const t = raw.toLowerCase()
  if (t.includes('mailo') || t === 'kibanja') return 'mailo'
  if (t.includes('lease')) return 'leasehold'
  if (t.includes('custom') || t.includes('process')) return 'customary'
  if (t.includes('free')) return 'freehold'
  return 'customary'
}

function mapAreaTier(
  tier: Property['areaTier'],
): 'prime' | 'mid-market' | 'emerging' | null {
  if (tier === 'prime') return 'prime'
  if (tier === 'mid') return 'mid-market'
  if (tier === 'emerging') return 'emerging'
  return null
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
    )
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const properties = filterProperties(
    getSeedProperties().map(enrichListing),
    { includeDrafts: true },
  )
  console.log(`Seeding ${properties.length} listings…`)

  let published = 0
  let drafts = 0
  let skipped = 0

  for (const p of properties) {
    const imageCount = p.images?.length ?? 0
    const status =
      p.status === 'published' && imageCount >= MIN_LISTING_IMAGES
        ? 'published'
        : 'draft'

    const row = {
      slug: p.slug,
      listing_mode: p.listingMode,
      category: mapCategory(p),
      status,
      title: p.title,
      description: p.description,
      area: p.area,
      area_tier: mapAreaTier(p.areaTier),
      price: p.priceUgx,
      price_negotiable: Boolean(p.priceNegotiable),
      currency: 'UGX',
      bedrooms:
        p.category === 'property' && p.useClass === 'residential'
          ? p.bedrooms
          : null,
      bathrooms:
        p.category === 'property' && p.useClass === 'residential'
          ? p.bathrooms
          : null,
      size_sqm:
        p.category === 'property' && 'sizeSqm' in p ? p.sizeSqm : null,
      plot_dimensions:
        p.category === 'land' ? p.plotDimensions : null,
      title_status: mapTitleStatus(p.titleStatus),
      encumbrances: p.category === 'land' ? 'None known' : null,
      deposit: p.depositMonths ?? null,
      min_lease_term: p.leaseTerm ?? null,
      amenities: p.amenities ?? [],
      highlights: [] as string[],
      location_notes: null as string | null,
      is_featured: Boolean(p.isFeatured),
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .upsert(row, { onConflict: 'slug' })
      .select('id')
      .single()

    if (error || !listing) {
      console.error(`Skip ${p.slug}:`, error?.message)
      skipped++
      continue
    }

    // Replace images for this listing
    await supabase.from('listing_images').delete().eq('listing_id', listing.id)

    const images = (p.images ?? []).map((img, i) => ({
      listing_id: listing.id,
      url: imageUrl(img),
      is_cover: Boolean(img.isCover) || i === 0,
      room_tag: img.roomTag ?? null,
      sort_order: i,
    }))

    if (images.length) {
      const { error: imgErr } = await supabase
        .from('listing_images')
        .insert(images)
      if (imgErr) {
        console.error(`Images fail ${p.slug}:`, imgErr.message)
      }
    }

    if (status === 'published') published++
    else drafts++
    console.log(
      `  ${status.padEnd(9)} ${p.slug} (${imageCount} photos)`,
    )
  }

  console.log(
    `\nDone. published=${published} draft=${drafts} skipped=${skipped}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
