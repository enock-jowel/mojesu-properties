/**
 * Property data layer — the single seam between UI and data source.
 *
 * Public reads come from Supabase (`status = 'published'`). Seed catalogs live
 * under scripts/seed-data/ and are not used at runtime.
 */

import type { AreaTier } from '@/lib/areas'
import {
  MIN_LISTING_IMAGES,
  type ListingStatus,
} from '@/lib/listing-validation'
import {
  defaultAmenitiesFor,
  type AmenityKey,
} from '@/lib/amenities'

export type ListingMode = 'rent' | 'sale'

export type { ListingStatus }
export { MIN_LISTING_IMAGES }

/** @deprecated Use ListingMode — kept as alias during migration */
export type ListingIntent = ListingMode

export type TitleStatus =
  | 'freehold'
  | 'leasehold'
  | 'mailo'
  | 'customary'
  | 'kibanja'

export type UseClass =
  | 'residential'
  | 'commercial'
  | 'agricultural'
  | 'industrial'
  | 'mixed-use'

export type PropertyCategory = 'property' | 'land'

export type ResidentialKind =
  | 'bungalow'
  | 'maisonette'
  | 'mansion'
  | 'storeyed'
  | 'cottage'
  | 'apartment'
  | 'condominium'
  | 'studio'
  | 'duplex'
  | 'flat'
  | 'servants-quarters'
  | 'gated-community'
  | 'estate-house'
  /** @deprecated legacy seed aliases */
  | 'house'
  | 'townhouse'
  | 'bedsitter'
  | 'selfcontained'

export type CommercialKind =
  | 'office'
  | 'retail'
  | 'shopping-mall'
  | 'showroom'
  | 'restaurant'
  | 'hotel'
  | 'coworking'
  | 'commercial-land'
  | 'petrol-station'
  /** @deprecated use industrial / mixed-use */
  | 'warehouse'
  | 'mixed-use'

export type IndustrialKind =
  | 'warehouse'
  | 'factory'
  | 'storage-yard'
  | 'industrial-land'
  | 'cold-room'

export type MixedUseKind =
  | 'mixed-use-building'
  | 'live-work'
  | 'multi-tenant'

export type LandKind =
  | 'kibanja'
  | 'mailo'
  | 'freehold'
  | 'leasehold'
  | 'residential-plot'
  | 'commercial-plot'
  | 'agricultural'
  | 'title-in-process'

/** Building kinds (non-land). */
export type PropertyKind =
  | ResidentialKind
  | CommercialKind
  | IndustrialKind
  | MixedUseKind

export const TITLE_STATUS_LABEL: Record<TitleStatus, string> = {
  freehold: 'Freehold',
  leasehold: 'Leasehold',
  mailo: 'Mailo',
  customary: 'Customary',
  kibanja: 'Kibanja',
}

export const RESIDENTIAL_KIND_LABEL: Record<ResidentialKind, string> = {
  bungalow: 'Bungalow',
  maisonette: 'Maisonette',
  mansion: 'Mansion / Villa',
  storeyed: 'Storeyed house',
  cottage: 'Cottage',
  apartment: 'Apartment',
  condominium: 'Condominium',
  studio: 'Studio apartment',
  duplex: 'Duplex',
  flat: 'Flat',
  'servants-quarters': "Servant's / Boys' quarters",
  'gated-community': 'Gated community house',
  'estate-house': 'Estate house',
  house: 'House',
  townhouse: 'Townhouse',
  bedsitter: 'Bedsitter',
  selfcontained: 'Self-contained',
}

export const COMMERCIAL_KIND_LABEL: Record<CommercialKind, string> = {
  office: 'Office space',
  retail: 'Retail shop',
  'shopping-mall': 'Shopping mall unit',
  showroom: 'Showroom',
  restaurant: 'Restaurant / bar space',
  hotel: 'Hotel / lodge property',
  coworking: 'Co-working space',
  'commercial-land': 'Commercial land',
  'petrol-station': 'Petrol station / fuel outlet',
  warehouse: 'Warehouse / Godown',
  'mixed-use': 'Mixed-use',
}

export const INDUSTRIAL_KIND_LABEL: Record<IndustrialKind, string> = {
  warehouse: 'Warehouse / Godown',
  factory: 'Factory / manufacturing space',
  'storage-yard': 'Storage yard',
  'industrial-land': 'Industrial land',
  'cold-room': 'Cold room facility',
}

export const MIXED_USE_KIND_LABEL: Record<MixedUseKind, string> = {
  'mixed-use-building': 'Mixed-use building',
  'live-work': 'Live-work unit',
  'multi-tenant': 'Multi-tenant complex',
}

export const LAND_KIND_LABEL: Record<LandKind, string> = {
  kibanja: 'Kibanja',
  mailo: 'Mailo land',
  freehold: 'Freehold land',
  leasehold: 'Leasehold land',
  'residential-plot': 'Plot (residential)',
  'commercial-plot': 'Plot (commercial)',
  agricultural: 'Agricultural land',
  'title-in-process': 'Land with title in process',
}

/** @deprecated Prefer category-specific label maps */
export const PROPERTY_KIND_LABEL: Record<string, string> = {
  ...RESIDENTIAL_KIND_LABEL,
  ...COMMERCIAL_KIND_LABEL,
  ...INDUSTRIAL_KIND_LABEL,
  ...MIXED_USE_KIND_LABEL,
}

export interface PropertyImage {
  /** Image URL */
  url: string
  /** Designated cover / hero shot — independent of upload order */
  isCover: boolean
  /** Optional room label (Living room, Kitchen, Exterior…) */
  roomTag?: string
  alt?: string
  /** @deprecated Use `url` */
  src?: string
}

/** Resolve image URL (supports legacy `src`). */
export function imageUrl(img: PropertyImage | undefined): string {
  if (!img) return '/placeholder.svg'
  return img.url || img.src || '/placeholder.svg'
}

/** Cover first, then remaining images in original order. */
export function orderedImages(images: PropertyImage[]): PropertyImage[] {
  if (!images.length) return images
  const coverIdx = images.findIndex((i) => i.isCover)
  if (coverIdx <= 0) return images
  const cover = images[coverIdx]
  return [cover, ...images.slice(0, coverIdx), ...images.slice(coverIdx + 1)]
}

export function getCoverImage(images: PropertyImage[]): PropertyImage | undefined {
  return orderedImages(images)[0]
}

interface PropertyBase {
  id: string
  slug: string
  title: string
  listingMode: ListingMode
  /**
   * `published` requires >= MIN_LISTING_IMAGES photos.
   * Incomplete/legacy listings stay `draft` and are excluded from public grids.
   */
  status: ListingStatus
  area: string
  /** Market tier for this area — used for similar-area fallback later */
  areaTier: AreaTier
  city: string
  /** Price in UGX. Rent = monthly; sale = asking price. */
  priceUgx: number
  /** Show “Negotiable” tag beside price when true */
  priceNegotiable?: boolean
  images: PropertyImage[]
  description: string
  /**
   * Present amenity keys only — absent keys are never shown.
   * Lookup: `lib/amenities.ts` (AMENITY_CATALOG).
   */
  amenities?: AmenityKey[]
  /** Rent: security deposit in months — shown in price/booking card */
  depositMonths?: number
  /** Rent: e.g. "1 year renewable" — shown in price/booking card */
  leaseTerm?: string
  listedAt: string
  /** ISO timestamp from CMS `updated_at` — freshness for SEO / GEO */
  updatedAt?: string
  verified: boolean
  /**
   * Land/property title tenure. Required on sale listings; omit on rent.
   */
  titleStatus?: TitleStatus
  /** Editorial flag for "Featured deals" row */
  isFeatured?: boolean
  /** Rolling 7-day view count — for "High demand" sorting */
  views7d?: number
  /** Rolling 7-day inquiry count — for "High demand" sorting */
  inquiries7d?: number
}

export interface ResidentialListing extends PropertyBase {
  category: 'property'
  useClass: 'residential'
  kind: ResidentialKind
  bedrooms: number
  bathrooms: number
  sizeSqm: number
}

export interface CommercialListing extends PropertyBase {
  category: 'property'
  useClass: 'commercial'
  kind: CommercialKind
  sizeSqm: number
}

export interface IndustrialListing extends PropertyBase {
  category: 'property'
  useClass: 'industrial'
  kind: IndustrialKind
  sizeSqm: number
}

export interface MixedUseListing extends PropertyBase {
  category: 'property'
  useClass: 'mixed-use'
  kind: MixedUseKind
  sizeSqm: number
  bedrooms?: number
  bathrooms?: number
}

export interface LandListing extends PropertyBase {
  category: 'land'
  useClass: 'residential' | 'commercial' | 'agricultural' | 'industrial'
  landKind: LandKind
  plotDimensions: string
}

export type Property =
  | ResidentialListing
  | CommercialListing
  | IndustrialListing
  | MixedUseListing
  | LandListing

/** @deprecated Use BuildingListing union via Property */
export type BuildingListing =
  | ResidentialListing
  | CommercialListing
  | IndustrialListing
  | MixedUseListing

export interface GetPropertiesOptions {
  listingMode?: ListingMode | 'all'
  /** @deprecated Use listingMode */
  intent?: ListingMode | 'all'
  category?: PropertyCategory | 'all'
  useClass?: UseClass | 'all'
  area?: string | 'all'
  areaTier?: AreaTier | 'all'
  kind?: string | 'all'
  landKind?: LandKind | 'all'
  titleStatus?: TitleStatus | TitleStatus[] | 'all'
  isFeatured?: boolean
  minBedrooms?: number
  maxPriceUgx?: number
  minPriceUgx?: number
  /** Include draft (incomplete) listings. Default: published only. */
  includeDrafts?: boolean
}

export function filterProperties(
  list: Property[],
  options: GetPropertiesOptions = {},
): Property[] {
  const listingMode = options.listingMode ?? options.intent ?? 'all'
  const {
    category = 'all',
    useClass = 'all',
    area = 'all',
    areaTier = 'all',
    kind = 'all',
    landKind = 'all',
    titleStatus = 'all',
    isFeatured,
    minBedrooms = 0,
    maxPriceUgx = 0,
    minPriceUgx = 0,
    includeDrafts = false,
  } = options

  let next = list

  if (!includeDrafts) {
    next = next.filter((p) => p.status === 'published')
  }
  if (listingMode !== 'all') {
    next = next.filter((p) => p.listingMode === listingMode)
  }
  if (category !== 'all') {
    next = next.filter((p) => p.category === category)
  }
  if (useClass !== 'all') {
    next = next.filter((p) => p.useClass === useClass)
  }
  if (area !== 'all') {
    next = next.filter((p) => p.area === area)
  }
  if (areaTier !== 'all') {
    next = next.filter((p) => p.areaTier === areaTier)
  }
  if (kind !== 'all') {
    next = next.filter(
      (p) => p.category === 'property' && p.kind === kind,
    )
  }
  if (landKind !== 'all') {
    next = next.filter(
      (p) => p.category === 'land' && p.landKind === landKind,
    )
  }
  if (titleStatus !== 'all') {
    const wanted = Array.isArray(titleStatus) ? titleStatus : [titleStatus]
    next = next.filter(
      (p) => p.titleStatus != null && wanted.includes(p.titleStatus),
    )
  }
  if (isFeatured === true) {
    next = next.filter((p) => p.isFeatured === true)
  }
  if (minBedrooms > 0) {
    next = next.filter(
      (p) =>
        p.category === 'property' &&
        p.useClass === 'residential' &&
        p.bedrooms >= minBedrooms,
    )
  }
  if (minPriceUgx > 0) {
    next = next.filter((p) => p.priceUgx >= minPriceUgx)
  }
  if (maxPriceUgx > 0) {
    next = next.filter((p) => p.priceUgx <= maxPriceUgx)
  }

  return next
}

/** Demand score for "High demand" row — inquiries weighted higher than views. */
export function demandScore(p: Property): number {
  return (p.inquiries7d ?? 0) * 5 + (p.views7d ?? 0)
}

export async function getProperties(
  options: GetPropertiesOptions = {},
): Promise<Property[]> {
  // Drafts are admin-only — public getters never return them.
  if (options.includeDrafts) {
    return []
  }

  const { getCachedPublishedProperties } = await import('@/lib/listings/cache')
  const fromDb = await getCachedPublishedProperties()
  return filterProperties(fromDb, options)
}

/** Fill amenities defaults; normalize cover image flags. */
export function enrichListing(raw: Property): Property {
  const images = raw.images.map((img) => ({
    ...img,
    url: img.url || img.src || '',
    isCover: img.isCover === true,
    alt: img.alt,
  }))
  if (!images.some((i) => i.isCover) && images[0]) {
    images[0] = { ...images[0], isCover: true }
  }

  const amenities =
    raw.amenities && raw.amenities.length > 0
      ? raw.amenities
      : defaultAmenitiesFor({
          category: raw.category,
          useClass: raw.useClass,
          listingMode: raw.listingMode,
          kind: raw.category === 'property' ? raw.kind : undefined,
        })

  const rentDefaults =
    raw.listingMode === 'rent'
      ? {
          depositMonths: raw.depositMonths ?? 2,
          leaseTerm: raw.leaseTerm ?? '1 year renewable',
        }
      : {}

  return {
    ...raw,
    images,
    amenities,
    ...rentDefaults,
  }
}

export async function getPropertyBySlug(
  slug: string,
  _options: { includeDrafts?: boolean } = {},
): Promise<Property | undefined> {
  const { getCachedPropertyBySlug } = await import('@/lib/listings/cache')
  const fromDb = await getCachedPropertyBySlug(slug)
  return fromDb ?? undefined
}

export async function getAreas(): Promise<string[]> {
  const all = await getProperties()
  return [...new Set(all.map((p) => p.area))].sort()
}

export function getListingKindLabel(property: Property): string {
  if (property.category === 'land') return LAND_KIND_LABEL[property.landKind]
  if (property.useClass === 'commercial') {
    return COMMERCIAL_KIND_LABEL[property.kind]
  }
  if (property.useClass === 'industrial') {
    return INDUSTRIAL_KIND_LABEL[property.kind]
  }
  if (property.useClass === 'mixed-use') {
    return MIXED_USE_KIND_LABEL[property.kind]
  }
  return RESIDENTIAL_KIND_LABEL[property.kind]
}

export function formatPriceUgx(priceUgx: number): string {
  return `UGX ${priceUgx.toLocaleString('en-US')}`
}

export function priceSuffix(property: Property): string {
  return property.listingMode === 'rent' ? '/month' : ''
}
