'use client'

import { createContext, useContext, useMemo } from 'react'
import {
  DEFAULT_AREAS,
  DEFAULT_FORMS,
  DEFAULT_NAV,
  DEFAULT_TAXONOMY,
  DEFAULT_VIEWING,
} from '@/lib/site-content/catalog-defaults'
import {
  formatViewingPassFrom,
  listingKindLabelFrom,
  typeOptionsFromTaxonomy,
} from '@/lib/site-content/catalog-helpers'
import type { SiteCatalog } from '@/lib/site-content/catalog-types'
import type { Property } from '@/lib/properties'
import type { HeroSubTab } from '@/lib/listing-kinds'
import type { AmenityKey } from '@/lib/amenities'
import { AMENITY_CATALOG } from '@/lib/amenities'

const SiteCatalogContext = createContext<SiteCatalog>({
  taxonomy: DEFAULT_TAXONOMY,
  areas: DEFAULT_AREAS,
  viewing: DEFAULT_VIEWING,
  forms: DEFAULT_FORMS,
  nav: DEFAULT_NAV,
})

export function SiteCatalogProvider({
  value,
  children,
}: {
  value: SiteCatalog
  children: React.ReactNode
}) {
  return (
    <SiteCatalogContext.Provider value={value}>
      {children}
    </SiteCatalogContext.Provider>
  )
}

export function useSiteCatalog(): SiteCatalog {
  return useContext(SiteCatalogContext)
}

export function useTaxonomy() {
  return useSiteCatalog().taxonomy
}

export function useAreasCatalog() {
  return useSiteCatalog().areas
}

export function useViewingConfig() {
  return useSiteCatalog().viewing
}

export function useFormsCopy() {
  return useSiteCatalog().forms
}

export function useNavCopy() {
  return useSiteCatalog().nav
}

export function useViewingPassBlurb(): string {
  return formatViewingPassFrom(useViewingConfig())
}

export function useListingKindLabel(property: Property): string {
  const taxonomy = useTaxonomy()
  return useMemo(
    () => listingKindLabelFrom(property, taxonomy),
    [property, taxonomy],
  )
}

export function useTypeOptions(
  main: 'rent' | 'buy' | 'land',
  sub: HeroSubTab,
) {
  const taxonomy = useTaxonomy()
  return useMemo(
    () => typeOptionsFromTaxonomy(main, sub, taxonomy),
    [main, sub, taxonomy],
  )
}

export function useAmenityLabel(key: string): string {
  const { amenityLabels } = useTaxonomy()
  return (
    amenityLabels[key] ||
    AMENITY_CATALOG[key as AmenityKey]?.label ||
    key
  )
}

export function useResolveAmenities(keys: string[] | undefined) {
  const { amenityLabels } = useTaxonomy()
  return useMemo(() => {
    if (!keys?.length) return []
    const out: { key: AmenityKey; iconClass: string; label: string }[] = []
    const seen = new Set<string>()
    for (const key of keys) {
      if (seen.has(key)) continue
      const def = AMENITY_CATALOG[key as AmenityKey]
      if (!def) continue
      seen.add(key)
      out.push({
        key: key as AmenityKey,
        iconClass: def.iconClass,
        label: amenityLabels[key] || def.label,
      })
    }
    return out
  }, [keys, amenityLabels])
}
