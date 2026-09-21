import type { ListingWriteInput } from '@/lib/listings/types'
import type { CmsCategory } from '@/lib/listings/types'
import type { PropertySubmissionRow } from '@/lib/requests/types'
import { areaTierToCms } from '@/lib/listings/map'
import { areaTierFrom } from '@/lib/site-content/catalog-helpers'
import { getAreasContent } from '@/lib/site-content/queries'

function mapCategory(raw: string | null): CmsCategory {
  if (raw === 'land') return 'land'
  if (raw === 'commercial') return 'commercial'
  // List With Us "house" covers house/apartment — default apartment
  return 'apartment'
}

/** Build a draft listing write payload from a List-With-Us submission. */
export async function submissionToListingPrefill(
  row: PropertySubmissionRow,
): Promise<
  Partial<ListingWriteInput> & {
    images: ListingWriteInput['images']
  }
> {
  const category = mapCategory(row.category)
  const area = row.area || ''
  const areas = await getAreasContent()
  const tier = area ? areaTierFrom(area, areas) : undefined

  return {
    listing_mode: row.listing_mode === 'sale' ? 'sale' : 'rent',
    category,
    status: 'draft',
    title: [CATEGORY_TITLE[category], area].filter(Boolean).join(' in ') ||
      'New listing from submission',
    area,
    area_tier: areaTierToCms(tier || ''),
    address_internal: row.rough_address || '',
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    plot_dimensions: row.approx_plot_size || '',
    floor_area: row.approx_floor_area,
    size_sqm: row.approx_floor_area,
    price: row.asking_price,
    price_negotiable: row.asking_price == null,
    encumbrances: category === 'land' ? 'None known' : null,
    images: (row.photo_urls || []).map((url, i) => ({
      url,
      is_cover: i === 0,
      sort_order: i,
    })),
    description: '',
    amenities: [],
    highlights: [],
  }
}

const CATEGORY_TITLE: Record<CmsCategory, string> = {
  house: 'House',
  apartment: 'Apartment',
  land: 'Land plot',
  commercial: 'Commercial unit',
}
