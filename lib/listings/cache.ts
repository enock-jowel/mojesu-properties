import { unstable_cache } from 'next/cache'
import {
  fetchPublishedProperties,
  fetchPublishedPropertyBySlug,
} from '@/lib/listings/queries'
import { enrichListing, type Property } from '@/lib/properties'

/** Cached published listings — shared by home, browse, sitemap, similar. */
export const getCachedPublishedProperties = unstable_cache(
  async (): Promise<Property[]> => {
    const fromDb = await fetchPublishedProperties()
    if (!fromDb) return []
    return fromDb.map(enrichListing)
  },
  ['published-properties-v1'],
  { revalidate: 60, tags: ['listings'] },
)

export const getCachedPropertyBySlug = unstable_cache(
  async (slug: string): Promise<Property | null> => {
    const fromDb = await fetchPublishedPropertyBySlug(slug)
    return fromDb ? enrichListing(fromDb) : null
  },
  ['published-property-by-slug-v1'],
  { revalidate: 60, tags: ['listings'] },
)

/** Lean similar set — avoids re-fetching full inventory per detail request. */
export async function getSimilarCached(
  item: Property,
  limit = 5,
): Promise<Property[]> {
  const all = await getCachedPublishedProperties()
  return all
    .filter((p) => p.id !== item.id)
    .filter((p) => {
      if (p.category !== item.category) return false
      if (p.listingMode !== item.listingMode) return false
      if (p.area === item.area) return true
      return p.areaTier === item.areaTier
    })
    .slice(0, limit)
}
