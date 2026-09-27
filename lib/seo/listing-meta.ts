import {
  formatPriceUgx,
  TITLE_STATUS_LABEL,
  type Property,
} from '@/lib/properties'

/**
 * Search-style nouns ("3-Bedroom House", "50x100 Residential Plot") built
 * from structured fields. The CMS `title` is marketing copy that often already
 * contains the area/bedrooms, so it is not used in the <title>.
 */
const RESIDENTIAL_NOUN: Record<string, string> = {
  bungalow: 'Bungalow',
  maisonette: 'Maisonette',
  mansion: 'Mansion',
  storeyed: 'Storeyed House',
  cottage: 'Cottage',
  apartment: 'Apartment',
  condominium: 'Condo',
  studio: 'Studio Apartment',
  duplex: 'Duplex',
  flat: 'Flat',
  'servants-quarters': "Boys' Quarters",
  'gated-community': 'House',
  'estate-house': 'House',
  house: 'House',
  townhouse: 'Townhouse',
  bedsitter: 'Bedsitter',
  selfcontained: 'Self-contained Apartment',
}

/** Studios and bedsitters are single rooms — a bedroom count reads oddly. */
const NO_BEDROOM_PREFIX = new Set(['studio', 'bedsitter', 'servants-quarters'])

const BUILDING_NOUN: Record<string, string> = {
  office: 'Office Space',
  retail: 'Shop',
  'shopping-mall': 'Mall Shop',
  showroom: 'Showroom',
  restaurant: 'Restaurant Space',
  hotel: 'Hotel',
  coworking: 'Co-working Space',
  'commercial-land': 'Commercial Land',
  'petrol-station': 'Petrol Station',
  warehouse: 'Warehouse',
  'mixed-use': 'Mixed-use Building',
  factory: 'Factory',
  'storage-yard': 'Storage Yard',
  'industrial-land': 'Industrial Land',
  'cold-room': 'Cold Room',
  'mixed-use-building': 'Mixed-use Building',
  'live-work': 'Live-work Unit',
  'multi-tenant': 'Commercial Building',
}

const LAND_NOUN: Record<string, string> = {
  'residential-plot': 'Residential Plot',
  'commercial-plot': 'Commercial Plot',
  agricultural: 'Agricultural Land',
  kibanja: 'Kibanja Plot',
  mailo: 'Mailo Land',
  freehold: 'Freehold Land',
  leasehold: 'Leasehold Land',
  'title-in-process': 'Land',
}

/** Districts/towns outside Kampala city where "…, Kampala" would be wrong. */
const NOT_KAMPALA = new Set(['wakiso', 'mukono', 'entebbe', 'mpigi', 'luweero', 'mityana'])

const TITLE_BUDGET = 51 // root layout appends " — Mojesu" (9 chars) → ≤60
const DESCRIPTION_BUDGET = 155

/** "50 x 100 ft" → "50x100"; "5 acres" → "5-Acre"; otherwise empty. */
function plotSizePrefix(dimensions: string): string {
  const grid = dimensions.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i)
  if (grid) return `${grid[1]}x${grid[2]}`
  const acres = dimensions.match(/(\d+(?:\.\d+)?)\s*acres?/i)
  if (acres) return `${acres[1]}-Acre`
  return ''
}

/**
 * Unambiguous words in the admin-written title/slug beat the structured kind,
 * which falls back to a default (office / residential-plot) when left unset.
 * First match wins, so more specific patterns come first.
 */
const LAND_HINTS: [RegExp, string][] = [
  [/commercial/i, 'Commercial Plot'],
  [/agricultur|farm/i, 'Agricultural Land'],
]
const BUILDING_HINTS: [RegExp, string][] = [
  [/warehouse/i, 'Warehouse'],
  [/mixed[- ]use/i, 'Mixed-use Building'],
  [/\bmall\b/i, 'Mall Shop'],
  [/retail/i, 'Retail Space'],
  [/\bshop\b/i, 'Shop'],
  [/serviced office/i, 'Serviced Office'],
  [/co-?working/i, 'Co-working Space'],
]
const HOUSE_HINTS: [RegExp, string][] = [
  [/maisonette/i, 'Maisonette'],
  [/townhouse/i, 'Townhouse'],
  [/bungalow/i, 'Bungalow'],
]
const NO_BEDROOM_HINTS: [RegExp, string][] = [
  [/bedsitter/i, 'Bedsitter'],
  [/studio/i, 'Studio Apartment'],
]

function hinted(item: Property, hints: [RegExp, string][]): string | undefined {
  const text = `${item.title} ${item.slug.replace(/-/g, ' ')}`
  return hints.find(([re]) => re.test(text))?.[1]
}

export function listingSearchNoun(item: Property): string {
  if (item.category === 'land') {
    const noun = hinted(item, LAND_HINTS) ?? LAND_NOUN[item.landKind] ?? 'Land'
    const size = plotSizePrefix(item.plotDimensions || '')
    return size ? `${size} ${noun}` : noun
  }
  if (item.useClass === 'residential') {
    if (NO_BEDROOM_PREFIX.has(item.kind)) return RESIDENTIAL_NOUN[item.kind]
    if (!item.bedrooms) return hinted(item, NO_BEDROOM_HINTS) ?? RESIDENTIAL_NOUN[item.kind] ?? 'House'
    const noun = RESIDENTIAL_NOUN[item.kind] ?? 'House'
    const refined = noun === 'House' ? (hinted(item, HOUSE_HINTS) ?? noun) : noun
    return `${item.bedrooms}-Bedroom ${refined}`
  }
  return hinted(item, BUILDING_HINTS) ?? BUILDING_NOUN[item.kind] ?? 'Property'
}

function placeName(area: string): string {
  const a = area.trim()
  return NOT_KAMPALA.has(a.toLowerCase()) ? a : `${a}, Kampala`
}

/** e.g. "3-Bedroom Apartment for Rent in Naalya, Kampala" (≤51 chars). */
export function listingSeoTitle(item: Property): string {
  const mode = item.listingMode === 'rent' ? 'for Rent' : 'for Sale'
  const noun = listingSearchNoun(item)
  const withCity = `${noun} ${mode} in ${placeName(item.area)}`
  if (withCity.length <= TITLE_BUDGET) return withCity
  const plain = `${noun} ${mode} in ${item.area}`
  if (plain.length <= TITLE_BUDGET) return plain
  return plain.slice(0, TITLE_BUDGET - 1).trimEnd() + '…'
}

/**
 * Facts-only description from listing data (price, size, tenure). Optional
 * clauses drop in order until it fits 155 chars — no invented claims.
 */
export function listingSeoDescription(item: Property): string {
  const mode = item.listingMode === 'rent' ? 'for rent' : 'for sale'
  const price =
    item.listingMode === 'rent'
      ? `${formatPriceUgx(item.priceUgx)}/month`
      : formatPriceUgx(item.priceUgx)

  const specs: string[] = []
  if (item.category === 'land') {
    // Size is already in the noun ("50x100 Residential Plot") when parseable.
    if (item.plotDimensions && !plotSizePrefix(item.plotDimensions)) {
      specs.push(item.plotDimensions)
    }
  } else {
    if ('bedrooms' in item && item.bedrooms) specs.push(`${item.bedrooms} bed`)
    if ('bathrooms' in item && item.bathrooms) specs.push(`${item.bathrooms} bath`)
    if (item.sizeSqm) specs.push(`${item.sizeSqm} m²`)
  }

  const noun = listingSearchNoun(item)
  const lead = `${noun} ${mode} in ${placeName(item.area)} at ${price}.`
  const optional = [
    specs.length ? `${specs.join(', ')}.` : '',
    item.listingMode === 'sale' && item.titleStatus
      ? `${TITLE_STATUS_LABEL[item.titleStatus]} title.`
      : '',
    item.verified ? 'Verified by Mojesu.' : '',
    item.category === 'land' ? 'Book a site visit.' : 'Book a viewing.',
  ].filter(Boolean)

  const parts = [lead, ...optional]
  while (parts.join(' ').length > DESCRIPTION_BUDGET && parts.length > 1) {
    // Drop the least important clause (just before the call to action).
    parts.splice(parts.length > 2 ? parts.length - 2 : 1, 1)
  }
  return parts.join(' ').slice(0, DESCRIPTION_BUDGET)
}
