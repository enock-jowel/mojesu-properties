/**
 * Google Places (New) — Place Details reviews.
 * Official API returns at most 5 reviews + aggregate rating/count.
 *
 * Env:
 *   GOOGLE_PLACES_API_KEY  — required (server-only)
 *   GOOGLE_PLACE_ID        — preferred (ChIJ…)
 *   GOOGLE_BUSINESS_MAPS_URL — optional; used once to help resolve place id
 */

import { unstable_cache } from 'next/cache'
import type { Review } from '@/lib/reviews'

export type GoogleReviewsResult = {
  reviews: Review[]
  aggregate: { average: number; count: number }
  mapsUri: string | null
  placeId: string
}

type PlacesReview = {
  name?: string
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  relativePublishTimeDescription?: string
  publishTime?: string
  authorAttribution?: {
    displayName?: string
    uri?: string
    photoUri?: string
  }
}

type PlaceDetailsResponse = {
  id?: string
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: PlacesReview[]
  error?: { message?: string; status?: string }
}

function clampRating(n: number): 1 | 2 | 3 | 4 | 5 {
  const r = Math.round(n)
  if (r <= 1) return 1
  if (r >= 5) return 5
  return r as 2 | 3 | 4
}

function mapReview(r: PlacesReview, index: number): Review | null {
  const quote = (r.text?.text || r.originalText?.text || '').trim()
  const authorName = (r.authorAttribution?.displayName || '').trim()
  if (!quote || !authorName) return null
  if (typeof r.rating !== 'number') return null

  const photo = r.authorAttribution?.photoUri || ''
  const when = r.relativePublishTimeDescription?.trim()
  const role = when ? `Google review · ${when}` : 'Google review'

  return {
    id: r.name || `google-review-${index}`,
    authorName,
    role,
    avatarUrl: photo || undefined,
    photoUrl: photo,
    rating: clampRating(r.rating),
    quote,
    relatedTo: 'other',
    createdAt: r.publishTime || new Date().toISOString(),
    featured: index === 0,
  }
}

/** Extract a ChIJ… / Places place id from common Maps / Business URL shapes. */
export function extractPlaceIdFromMapsUrl(url: string): string | null {
  try {
    const u = new URL(url.trim())
    const qid = u.searchParams.get('query_place_id') || u.searchParams.get('place_id')
    if (qid && /^ChIJ[\w-]+$/.test(qid)) return qid

    // /maps/place/.../data=...!1s0x...:0x... or !1sChIJ...
    const dataMatch = url.match(/!1s(ChIJ[\w-]+)/)
    if (dataMatch?.[1]) return dataMatch[1]

    const pathMatch = url.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/)
    if (pathMatch?.[1]) {
      // Hex feature id — not a ChIJ id; caller must resolve via Text
      return null
    }

    const chijInPath = url.match(/(ChIJ[\w-]{20,})/)
    if (chijInPath?.[1]) return chijInPath[1]
  } catch {
    /* ignore */
  }
  return null
}

export function getConfiguredPlaceId(): string | null {
  const direct = process.env.GOOGLE_PLACE_ID?.trim()
  if (direct) return direct.replace(/^places\//, '')

  const mapsUrl = process.env.GOOGLE_BUSINESS_MAPS_URL?.trim()
  if (mapsUrl) return extractPlaceIdFromMapsUrl(mapsUrl)
  return null
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceDetailsResponse> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim()
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY is not set')

  const id = placeId.replace(/^places\//, '')
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask':
        'id,displayName,rating,userRatingCount,googleMapsUri,reviews',
    },
    cache: 'no-store',
  })

  const json = (await res.json()) as PlaceDetailsResponse
  if (!res.ok) {
    const msg = json.error?.message || `Places API HTTP ${res.status}`
    throw new Error(msg)
  }
  return json
}

async function loadGoogleReviewsForPlace(
  placeId: string,
): Promise<GoogleReviewsResult | null> {
  const details = await fetchPlaceDetails(placeId)
  const mapped = (details.reviews || [])
    .map((r, i) => mapReview(r, i))
    .filter((r): r is Review => r != null)

  const average =
    typeof details.rating === 'number'
      ? Math.round(details.rating * 10) / 10
      : mapped.length
        ? Math.round(
            (mapped.reduce((s, r) => s + r.rating, 0) / mapped.length) * 10,
          ) / 10
        : 0

  const count =
    typeof details.userRatingCount === 'number' && details.userRatingCount > 0
      ? details.userRatingCount
      : mapped.length

  if (mapped.length === 0 && count === 0) return null

  return {
    reviews: mapped,
    aggregate: { average, count },
    mapsUri: details.googleMapsUri || null,
    placeId: details.id || placeId,
  }
}

const getCachedGoogleReviews = unstable_cache(
  async (placeId: string) => loadGoogleReviewsForPlace(placeId),
  ['google-place-reviews-v1'],
  { revalidate: 3600, tags: ['google-reviews'] },
)

/**
 * Cached Google reviews (1h). Returns null when env is incomplete or API fails
 * (caller should fall back to CMS reviews).
 */
export async function fetchGoogleReviews(): Promise<GoogleReviewsResult | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim()
  const placeId = getConfiguredPlaceId()
  if (!key || !placeId) return null

  try {
    return await getCachedGoogleReviews(placeId)
  } catch (err) {
    console.error('[google-reviews]', err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Resolve a Place ID from a Google Maps / Business Profile URL via Text Text.
 * Run: pnpm exec tsx scripts/resolve-google-place-id.ts "<maps-url>"
 */
export async function resolvePlaceIdFromMapsUrl(
  mapsUrl: string,
): Promise<{ placeId: string; displayName?: string } | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim()
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY is not set')

  const extracted = extractPlaceIdFromMapsUrl(mapsUrl)
  if (extracted) {
    return { placeId: extracted }
  }

  // Derive a search query from the /maps/place/Name/... path segment
  let textQuery = mapsUrl
  try {
    const u = new URL(mapsUrl)
    const parts = u.pathname.split('/').filter(Boolean)
    const placeIdx = parts.indexOf('place')
    if (placeIdx >= 0 && parts[placeIdx + 1]) {
      textQuery = decodeURIComponent(parts[placeIdx + 1].replace(/\+/g, ' '))
    }
  } catch {
    /* use raw */
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 1,
      languageCode: 'en',
    }),
  })

  const json = (await res.json()) as {
    places?: { id?: string; displayName?: { text?: string } }[]
    error?: { message?: string }
  }
  if (!res.ok) {
    throw new Error(json.error?.message || `Search HTTP ${res.status}`)
  }
  const place = json.places?.[0]
  if (!place?.id) return null
  return {
    placeId: place.id,
    displayName: place.displayName?.text,
  }
}
