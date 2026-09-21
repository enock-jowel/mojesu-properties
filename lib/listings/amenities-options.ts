import { AMENITY_CATALOG, type AmenityKey } from '@/lib/amenities'
import { cmsCategoryToAmenityGroup } from '@/lib/listings/map'
import type { CmsCategory } from '@/lib/listings/types'

const LAND_KEYS: AmenityKey[] = [
  'surveyed',
  'road_access',
  'tarmac_nearby',
  'power_nearby',
  'water_access',
  'fenced',
  'build_ready',
  'title_clear',
]

const COMMERCIAL_KEYS: AmenityKey[] = [
  'three_phase',
  'generator',
  'client_parking',
  'loading_access',
  'cctv',
  'fibre',
  'shell_core',
  'elevator',
  'open_plan',
  'reception',
]

const RESIDENTIAL_KEYS: AmenityKey[] = [
  'parking',
  'gated',
  'generator',
  'water_tank',
  'furnished',
  'semi_furnished',
  'fibre',
  'pets',
  'nwsc',
  'umeme_prepaid',
  'shared_yaka',
  'own_yaka',
  'balcony',
  'compound',
  'master_ensuite',
  'kitchen_fitted',
  'air_conditioning',
  'wardrobe',
  'tv',
  'solar',
]

/** Amenity checklist options for the admin editor — same catalog as public detail. */
export function amenityOptionsForCategory(
  category: CmsCategory,
  labels?: Record<string, string>,
): {
  key: AmenityKey
  label: string
}[] {
  const group = cmsCategoryToAmenityGroup(category)
  const keys =
    group === 'land'
      ? LAND_KEYS
      : group === 'commercial'
        ? COMMERCIAL_KEYS
        : RESIDENTIAL_KEYS
  return keys.map((key) => ({
    key,
    label: labels?.[key] || AMENITY_CATALOG[key].label,
  }))
}
