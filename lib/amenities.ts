/**
 * Amenity keys → Flaticon UIcons (solid-rounded) + label.
 * Every amenity has its own wired icon — add new keys here only.
 *
 * Icons: https://www.flaticon.com/uicons
 * Packs: @flaticon/flaticon-uicons (solid/regular rounded + brands) via app/layout.tsx
 */

export type AmenityKey =
  /* residential — essentials */
  | 'parking'
  | 'gated'
  | 'generator'
  | 'water_tank'
  | 'furnished'
  | 'semi_furnished'
  | 'fibre'
  | 'pets'
  | 'nwsc'
  | 'umeme_prepaid'
  | 'shared_yaka'
  | 'own_yaka'
  | 'balcony'
  | 'compound'
  | 'master_ensuite'
  | 'kitchen_fitted'
  | 'air_conditioning'
  | 'wardrobe'
  | 'tv'
  | 'solar'
  /* land */
  | 'surveyed'
  | 'road_access'
  | 'tarmac_nearby'
  | 'power_nearby'
  | 'water_access'
  | 'fenced'
  | 'build_ready'
  | 'title_clear'
  /* commercial */
  | 'three_phase'
  | 'loading_access'
  | 'open_plan'
  | 'shell_core'
  | 'cctv'
  | 'client_parking'
  | 'elevator'
  | 'reception'

export interface AmenityDef {
  /** Flaticon class pair, e.g. "fi fi-sr-garage" */
  iconClass: string
  label: string
}

/**
 * Full icon package — each key maps to one distinct Flaticon glyph.
 * Do not hardcode icon/label pairs in React components.
 */
export const AMENITY_CATALOG: Record<AmenityKey, AmenityDef> = {
  // Residential
  parking: { iconClass: 'fi fi-sr-parking', label: 'Parking available' },
  gated: { iconClass: 'fi fi-sr-house-lock', label: 'Gated compound' },
  generator: { iconClass: 'fi fi-sr-battery-bolt', label: 'Backup generator' },
  water_tank: { iconClass: 'fi fi-sr-water', label: 'Water tank' },
  furnished: { iconClass: 'fi fi-sr-couch', label: 'Furnished' },
  semi_furnished: { iconClass: 'fi fi-sr-chair', label: 'Semi-furnished' },
  fibre: { iconClass: 'fi fi-sr-wifi', label: 'Fibre internet ready' },
  pets: { iconClass: 'fi fi-sr-paw', label: 'Pet-friendly' },
  nwsc: { iconClass: 'fi fi-sr-faucet', label: 'NWSC water' },
  umeme_prepaid: { iconClass: 'fi fi-sr-bolt', label: 'Umeme prepaid' },
  shared_yaka: {
    iconClass: 'fi fi-sr-meter',
    label: 'Shared Yaka meter',
  },
  own_yaka: {
    iconClass: 'fi fi-sr-meter-bolt',
    label: 'Own Yaka meter',
  },
  balcony: { iconClass: 'fi fi-sr-terrace', label: 'Balcony' },
  compound: { iconClass: 'fi fi-sr-tree', label: 'Private compound' },
  master_ensuite: { iconClass: 'fi fi-sr-shower', label: 'Master ensuite' },
  kitchen_fitted: { iconClass: 'fi fi-sr-knife-kitchen', label: 'Fitted kitchen' },
  air_conditioning: {
    iconClass: 'fi fi-sr-air-conditioner',
    label: 'Air conditioning',
  },
  wardrobe: { iconClass: 'fi fi-sr-bed', label: 'Built-in wardrobes' },
  tv: { iconClass: 'fi fi-sr-tv-retro', label: 'TV point ready' },
  solar: { iconClass: 'fi fi-sr-solar-panel', label: 'Solar backup' },

  // Land
  surveyed: { iconClass: 'fi fi-sr-ruler-triangle', label: 'Surveyed / beaconed' },
  road_access: { iconClass: 'fi fi-sr-road', label: 'Road access' },
  tarmac_nearby: { iconClass: 'fi fi-sr-car', label: 'Near tarmac road' },
  power_nearby: { iconClass: 'fi fi-sr-plug', label: 'Electricity nearby' },
  water_access: { iconClass: 'fi fi-sr-hand-holding-droplet', label: 'Water access' },
  fenced: { iconClass: 'fi fi-sr-fence', label: 'Fenced plot' },
  build_ready: { iconClass: 'fi fi-sr-check-circle', label: 'Build-ready' },
  title_clear: { iconClass: 'fi fi-sr-document', label: 'Clear title docs' },

  // Commercial — class names must exist in uicons-solid-rounded 2.6.0
  three_phase: { iconClass: 'fi fi-sr-charging-station', label: '3-phase power' },
  loading_access: { iconClass: 'fi fi-sr-dolly-flatbed', label: 'Loading access' },
  open_plan: { iconClass: 'fi fi-sr-building', label: 'Open-plan layout' },
  shell_core: { iconClass: 'fi fi-sr-warehouse-alt', label: 'Shell & core' },
  cctv: { iconClass: 'fi fi-sr-camera-cctv', label: 'CCTV security' },
  client_parking: { iconClass: 'fi fi-sr-car-garage', label: 'Client parking' },
  elevator: { iconClass: 'fi fi-sr-elevator', label: 'Elevator access' },
  reception: { iconClass: 'fi fi-sr-desk', label: 'Reception desk' },
}

export const AMENITY_PREVIEW_COUNT = 10

export function resolveAmenities(
  keys: string[] | undefined,
): { key: AmenityKey; iconClass: string; label: string }[] {
  if (!keys?.length) return []
  const out: { key: AmenityKey; iconClass: string; label: string }[] = []
  const seen = new Set<string>()
  for (const key of keys) {
    if (seen.has(key)) continue
    const def = AMENITY_CATALOG[key as AmenityKey]
    if (!def) continue
    seen.add(key)
    out.push({ key: key as AmenityKey, iconClass: def.iconClass, label: def.label })
  }
  return out
}

/** Category-relevant defaults — only keys that are true/present. */
export function defaultAmenitiesFor(input: {
  category: 'property' | 'land'
  useClass?: string
  listingMode: 'rent' | 'sale'
  kind?: string
}): AmenityKey[] {
  if (input.category === 'land') {
    return [
      'surveyed',
      'road_access',
      'tarmac_nearby',
      'power_nearby',
      'water_access',
      'build_ready',
      'title_clear',
      'fenced',
    ]
  }

  if (input.useClass === 'commercial') {
    return [
      'three_phase',
      'generator',
      'client_parking',
      'loading_access',
      'cctv',
      'fibre',
      'shell_core',
      'elevator',
      'open_plan',
    ]
  }

  if (input.useClass === 'industrial') {
    return [
      'three_phase',
      'generator',
      'loading_access',
      'cctv',
      'client_parking',
      'shell_core',
    ]
  }

  if (input.useClass === 'mixed-use') {
    return [
      'parking',
      'elevator',
      'cctv',
      'fibre',
      'client_parking',
      'generator',
      'open_plan',
    ]
  }

  const list: AmenityKey[] = [
    'parking',
    'gated',
    'water_tank',
    'nwsc',
    'fibre',
    'kitchen_fitted',
  ]

  // Electricity: apartments often share Yaka; houses/townhouses more often own
  if (
    input.kind === 'apartment' ||
    input.kind === 'studio' ||
    input.kind === 'bedsitter' ||
    input.kind === 'selfcontained'
  ) {
    list.push('shared_yaka')
  } else {
    list.push('own_yaka')
  }

  if (input.kind === 'apartment' || input.kind === 'studio') {
    list.push('balcony')
  } else {
    list.push('compound')
  }

  if (
    input.kind === 'apartment' ||
    input.kind === 'townhouse' ||
    input.kind === 'maisonette' ||
    input.kind === 'storeyed' ||
    input.kind === 'house' ||
    input.kind === 'bungalow' ||
    input.kind === 'mansion' ||
    input.kind === 'selfcontained'
  ) {
    list.push('master_ensuite', 'wardrobe')
  }

  if (input.kind === 'bedsitter' || input.kind === 'studio') {
    list.push('semi_furnished')
  } else if (input.listingMode === 'rent' && input.kind === 'apartment') {
    list.push('furnished')
  }

  if (input.listingMode === 'rent') {
    list.push('generator')
  }

  if (input.kind === 'mansion' || input.kind === 'storeyed') {
    list.push('air_conditioning', 'solar')
  }

  return list
}
