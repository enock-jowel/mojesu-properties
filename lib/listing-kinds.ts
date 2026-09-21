/**
 * Uganda listing type catalogs — hero Type segment + labels.
 * Keep value keys stable; labels are what users see.
 */

export type HeroSubTab =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'mixed-use'
  | 'agricultural'

export type ListingTypeOption = { value: string; label: string }

/** Residential property types (Rent / Buy → Residential) */
export const RESIDENTIAL_TYPE_OPTIONS: ListingTypeOption[] = [
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'mansion', label: 'Mansion / Villa' },
  { value: 'storeyed', label: 'Storeyed house' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condominium', label: 'Condominium' },
  { value: 'studio', label: 'Studio apartment' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'flat', label: 'Flat' },
  { value: 'servants-quarters', label: "Servant's / Boys' quarters" },
  { value: 'gated-community', label: 'Gated community house' },
  { value: 'estate-house', label: 'Estate house' },
]

/** Land types — tenure + plot forms (Land tab) */
export const LAND_TYPE_OPTIONS: ListingTypeOption[] = [
  { value: 'kibanja', label: 'Kibanja' },
  { value: 'mailo', label: 'Mailo land' },
  { value: 'freehold', label: 'Freehold land' },
  { value: 'leasehold', label: 'Leasehold land' },
  { value: 'residential-plot', label: 'Plot (residential)' },
  { value: 'commercial-plot', label: 'Plot (commercial)' },
  { value: 'agricultural', label: 'Agricultural land' },
  { value: 'title-in-process', label: 'Land with title in process' },
]

/** Tenure-style land types — filter via titleStatus when selected */
export const LAND_TITLE_TYPE_VALUES = new Set([
  'kibanja',
  'mailo',
  'freehold',
  'leasehold',
])

/** Commercial property types */
export const COMMERCIAL_TYPE_OPTIONS: ListingTypeOption[] = [
  { value: 'office', label: 'Office space' },
  { value: 'retail', label: 'Retail shop' },
  { value: 'shopping-mall', label: 'Shopping mall unit' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'restaurant', label: 'Restaurant / bar space' },
  { value: 'hotel', label: 'Hotel / lodge property' },
  { value: 'coworking', label: 'Co-working space' },
  { value: 'commercial-land', label: 'Commercial land' },
  { value: 'petrol-station', label: 'Petrol station / fuel outlet' },
]

/** Industrial property types */
export const INDUSTRIAL_TYPE_OPTIONS: ListingTypeOption[] = [
  { value: 'warehouse', label: 'Warehouse / Godown' },
  { value: 'factory', label: 'Factory / manufacturing space' },
  { value: 'storage-yard', label: 'Storage yard' },
  { value: 'industrial-land', label: 'Industrial land' },
  { value: 'cold-room', label: 'Cold room facility' },
]

/** Mixed-use property types */
export const MIXED_USE_TYPE_OPTIONS: ListingTypeOption[] = [
  { value: 'mixed-use-building', label: 'Mixed-use building' },
  { value: 'live-work', label: 'Live-work unit' },
  { value: 'multi-tenant', label: 'Multi-tenant complex' },
]

export function typeOptionsForSubTab(
  main: 'rent' | 'buy' | 'land',
  sub: HeroSubTab,
): ListingTypeOption[] {
  if (main === 'land') return LAND_TYPE_OPTIONS
  if (sub === 'commercial') return COMMERCIAL_TYPE_OPTIONS
  if (sub === 'industrial') return INDUSTRIAL_TYPE_OPTIONS
  if (sub === 'mixed-use') return MIXED_USE_TYPE_OPTIONS
  return RESIDENTIAL_TYPE_OPTIONS
}
