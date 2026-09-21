import { getAreaTier, type AreaTier } from '@/lib/areas'
import type { AmenityKey } from '@/lib/amenities'
import type {
  LandKind,
  Property,
  PropertyImage,
  ResidentialKind,
  TitleStatus,
} from '@/lib/properties'
import type {
  CmsAreaTier,
  CmsCategory,
  ListingRow,
  ListingWriteInput,
} from '@/lib/listings/types'

export function areaTierToCms(tier: AreaTier | '' | null | undefined): CmsAreaTier | null {
  if (tier === 'prime') return 'prime'
  if (tier === 'mid') return 'mid-market'
  if (tier === 'emerging') return 'emerging'
  return null
}

export function areaTierFromCms(tier: CmsAreaTier | null | undefined): AreaTier {
  if (tier === 'prime') return 'prime'
  if (tier === 'mid-market') return 'mid'
  if (tier === 'emerging') return 'emerging'
  return 'mid'
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function mapImages(row: ListingRow): PropertyImage[] {
  const imgs = [...(row.listing_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )
  return imgs.map((img, i) => ({
    url: img.url,
    isCover: Boolean(img.is_cover) || i === 0,
    roomTag: img.room_tag ?? undefined,
    alt: row.title,
  }))
}

function inferLandKind(row: ListingRow): LandKind {
  const t = row.title_status
  if (t === 'mailo') return 'mailo'
  if (t === 'freehold') return 'freehold'
  if (t === 'leasehold') return 'leasehold'
  if (t === 'customary') return 'title-in-process'
  const z = (row.zoning || '').toLowerCase()
  if (z.includes('agric')) return 'agricultural'
  if (z.includes('commerc')) return 'commercial-plot'
  return 'residential-plot'
}

function inferResidentialKind(category: CmsCategory): ResidentialKind {
  if (category === 'apartment') return 'apartment'
  return 'house'
}

/** DB row → public `Property` shape (keeps browse/detail components unchanged). */
export function listingRowToProperty(row: ListingRow): Property {
  const images = mapImages(row)
  const areaTier =
    areaTierFromCms(row.area_tier) || getAreaTier(row.area) || 'mid'
  const base = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    listingMode: row.listing_mode,
    status: row.status === 'published' ? ('published' as const) : ('draft' as const),
    area: row.area,
    areaTier,
    city: 'Kampala',
    priceUgx: Number(row.price ?? 0),
    priceNegotiable: Boolean(row.price_negotiable),
    images,
    description: row.description || '',
    amenities: (row.amenities ?? []) as AmenityKey[],
    depositMonths: row.deposit != null ? Number(row.deposit) : undefined,
    leaseTerm: row.min_lease_term ?? undefined,
    listedAt: row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    updatedAt: row.updated_at || undefined,
    verified: row.status === 'published',
    titleStatus: (row.title_status as TitleStatus | null) ?? undefined,
    isFeatured: Boolean(row.is_featured),
  }

  if (row.category === 'land') {
    return {
      ...base,
      category: 'land',
      useClass: 'residential',
      landKind: inferLandKind(row),
      plotDimensions: row.plot_dimensions || row.plot_size_total || '—',
    }
  }

  if (row.category === 'commercial') {
    return {
      ...base,
      category: 'property',
      useClass: 'commercial',
      kind: 'office',
      sizeSqm: Number(row.floor_area ?? row.size_sqm ?? 0),
    }
  }

  return {
    ...base,
    category: 'property',
    useClass: 'residential',
    kind: inferResidentialKind(row.category),
    bedrooms: Number(row.bedrooms ?? 0),
    bathrooms: Number(row.bathrooms ?? 0),
    sizeSqm: Number(row.size_sqm ?? 0),
  }
}

export function formatPriceLabel(price: number | null, mode: 'rent' | 'sale'): string {
  if (price == null || Number.isNaN(Number(price))) return '—'
  const n = Number(price)
  const formatted = new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(n)
  return mode === 'rent' ? `UGX ${formatted}/mo` : `UGX ${formatted}`
}

export const HIGHLIGHT_SUGGESTIONS = [
  'Recently renovated',
  'Gated compound',
  'Ready title',
  'Quiet neighbourhood',
  'Near tarmac',
  'Move-in ready',
] as const

export const ROOM_TAGS = [
  'Exterior',
  'Living room',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Other',
] as const

export const CATEGORY_LABEL: Record<CmsCategory, string> = {
  house: 'House',
  apartment: 'Apartment',
  land: 'Land',
  commercial: 'Commercial',
}

export function cmsCategoryToAmenityGroup(
  category: CmsCategory,
): 'land' | 'commercial' | 'residential' {
  if (category === 'land') return 'land'
  if (category === 'commercial') return 'commercial'
  return 'residential'
}
