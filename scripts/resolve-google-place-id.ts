/**
 * Resolve GOOGLE_PLACE_ID from a Google Maps / Business link.
 *
 * Usage:
 *   pnpm exec tsx scripts/resolve-google-place-id.ts "https://maps.google.com/..."
 *
 * Requires GOOGLE_PLACES_API_KEY in .env.preview.local (or .env.local).
 */
import { config } from 'dotenv'
import path from 'node:path'
import {
  extractPlaceIdFromMapsUrl,
  resolvePlaceIdFromMapsUrl,
} from '../lib/google-reviews/fetch'

const root = path.resolve(__dirname, '..')
config({ path: path.join(root, '.env.preview.local'), override: true })
config({ path: path.join(root, '.env.local') })

async function main() {
  const url = process.argv[2]?.trim()
  if (!url) {
    console.error(
      'Usage: pnpm exec tsx scripts/resolve-google-place-id.ts "<google-maps-or-business-url>"',
    )
    process.exit(1)
  }

  if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    console.error('Set GOOGLE_PLACES_API_KEY in .env.preview.local first.')
    process.exit(1)
  }

  const extracted = extractPlaceIdFromMapsUrl(url)
  if (extracted) {
    console.log('Place ID (from URL):', extracted)
    console.log('\nAdd to .env.preview.local:')
    console.log(`GOOGLE_PLACE_ID=${extracted}`)
    console.log(`GOOGLE_BUSINESS_MAPS_URL=${url}`)
    return
  }

  console.log('No ChIJ id in URL — searching Places API…')
  const found = await resolvePlaceIdFromMapsUrl(url)
  if (!found) {
    console.error('Could not resolve a Place ID. Check the link and API key.')
    process.exit(1)
  }
  console.log('Display name:', found.displayName || '(unknown)')
  console.log('Place ID:', found.placeId)
  console.log('\nAdd to .env.preview.local:')
  console.log(`GOOGLE_PLACE_ID=${found.placeId}`)
  console.log(`GOOGLE_BUSINESS_MAPS_URL=${url}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
