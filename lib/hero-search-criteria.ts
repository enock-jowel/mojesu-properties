/**
 * Shared criteria shape for the hero search pill → live counts + browse URLs.
 */

import type { AreaTier } from '@/lib/areas'
import {
  filterProperties,
  type GetPropertiesOptions,
  type Property,
  type TitleStatus,
  type UseClass,
} from '@/lib/properties'
import {
  LAND_TITLE_TYPE_VALUES,
  type HeroSubTab,
} from '@/lib/listing-kinds'

export type HeroMainTab = 'rent' | 'buy' | 'land'
export type { HeroSubTab }

export type HeroSearchCriteria = {
  mainTab: HeroMainTab
  subTab: HeroSubTab
  area: string
  areaTier: AreaTier | ''
  listingType: string
  minPriceUgx?: number
  maxPriceUgx?: number
  titleStatuses: TitleStatus[]
}

export const DEFAULT_HERO_CRITERIA: HeroSearchCriteria = {
  mainTab: 'rent',
  subTab: 'residential',
  area: '',
  areaTier: '',
  listingType: '',
  titleStatuses: [],
}

export function heroDestinationPath(main: HeroMainTab): string {
  if (main === 'rent') return '/rent/'
  if (main === 'land') return '/land/'
  return '/buy/'
}

function resolveUseClass(c: HeroSearchCriteria): UseClass {
  if (c.mainTab === 'land') {
    if (c.listingType === 'commercial-plot' || c.listingType === 'commercial-land') {
      return 'commercial'
    }
    if (c.listingType === 'agricultural') return 'agricultural'
    if (c.listingType === 'industrial-land') return 'industrial'
    return 'residential'
  }
  if (c.subTab === 'commercial') return 'commercial'
  if (c.subTab === 'industrial') return 'industrial'
  if (c.subTab === 'mixed-use') return 'mixed-use'
  if (c.subTab === 'agricultural') return 'agricultural'
  return 'residential'
}

export function heroCriteriaToOptions(
  c: HeroSearchCriteria,
): GetPropertiesOptions {
  const useClass = resolveUseClass(c)

  if (c.mainTab === 'land') {
    const isTitleType = LAND_TITLE_TYPE_VALUES.has(c.listingType)
    const titleFromType = isTitleType
      ? ([c.listingType] as TitleStatus[])
      : []
    const titles =
      c.titleStatuses.length > 0
        ? c.titleStatuses
        : titleFromType.length > 0
          ? titleFromType
          : undefined

    return {
      listingMode: 'sale',
      category: 'land',
      useClass: c.listingType ? useClass : 'all',
      area: c.area || 'all',
      areaTier: c.areaTier || 'all',
      landKind:
        c.listingType && !isTitleType
          ? (c.listingType as GetPropertiesOptions['landKind'])
          : 'all',
      titleStatus: titles?.length ? titles : 'all',
      minPriceUgx: c.minPriceUgx ?? 0,
      maxPriceUgx: c.maxPriceUgx ?? 0,
    }
  }

  return {
    listingMode: c.mainTab === 'rent' ? 'rent' : 'sale',
    category: 'property',
    useClass,
    area: c.area || 'all',
    areaTier: c.areaTier || 'all',
    kind: c.listingType || 'all',
    titleStatus: c.titleStatuses.length ? c.titleStatuses : 'all',
    minPriceUgx: c.minPriceUgx ?? 0,
    maxPriceUgx: c.maxPriceUgx ?? 0,
  }
}

export function filterByHeroCriteria(
  properties: Property[],
  c: HeroSearchCriteria,
): Property[] {
  return filterProperties(properties, heroCriteriaToOptions(c))
}

export function heroCriteriaToHref(c: HeroSearchCriteria): string {
  const path = heroDestinationPath(c.mainTab)
  const params = new URLSearchParams()
  params.set('use', c.subTab)
  if (c.area) {
    params.set('location', c.area)
    if (c.areaTier) params.set('tier', c.areaTier)
  }
  if (c.listingType) params.set('type', c.listingType)
  if (c.minPriceUgx != null && c.minPriceUgx > 0) {
    params.set('priceMin', String(c.minPriceUgx))
  }
  if (c.maxPriceUgx != null && c.maxPriceUgx > 0) {
    params.set('priceMax', String(c.maxPriceUgx))
  }
  if (c.titleStatuses.length > 0) {
    params.set('titleStatus', c.titleStatuses.join(','))
  } else if (
    c.mainTab === 'land' &&
    LAND_TITLE_TYPE_VALUES.has(c.listingType)
  ) {
    params.set('titleStatus', c.listingType)
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}
