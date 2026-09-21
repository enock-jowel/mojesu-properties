import type { AreaTier } from '@/lib/areas'
import type { Property } from '@/lib/properties'
import type {
  AreasContent,
  LabelOption,
  TaxonomyContent,
  ViewingContent,
} from '@/lib/site-content/catalog-types'
import { DEFAULT_TAXONOMY, DEFAULT_VIEWING } from '@/lib/site-content/catalog-defaults'
import type { HeroSubTab } from '@/lib/listing-kinds'

export function formatViewingPassFrom(viewing: ViewingContent): string {
  return `UGX ${viewing.feeUgx.toLocaleString('en-US')} for ${viewing.passProperties} property viewings — valid for ${viewing.passDays} days`
}

export function kindLabelMap(taxonomy: TaxonomyContent): Record<string, string> {
  const out: Record<string, string> = {
    ...taxonomy.residentialExtras,
    ...taxonomy.commercialExtras,
  }
  for (const o of [
    ...taxonomy.residential,
    ...taxonomy.land,
    ...taxonomy.commercial,
    ...taxonomy.industrial,
    ...taxonomy.mixedUse,
  ]) {
    out[o.value] = o.label
  }
  return out
}

export function listingKindLabelFrom(
  property: Property,
  taxonomy: TaxonomyContent = DEFAULT_TAXONOMY,
): string {
  const map = kindLabelMap(taxonomy)
  if (property.category === 'land') {
    return map[property.landKind] || property.landKind
  }
  return map[property.kind] || property.kind
}

export function typeOptionsFromTaxonomy(
  main: 'rent' | 'buy' | 'land',
  sub: HeroSubTab,
  taxonomy: TaxonomyContent,
): LabelOption[] {
  if (main === 'land') return taxonomy.land
  if (sub === 'commercial') return taxonomy.commercial
  if (sub === 'industrial') return taxonomy.industrial
  if (sub === 'mixed-use') return taxonomy.mixedUse
  return taxonomy.residential
}

export function areasGroupedFrom(
  areas: AreasContent,
): Record<AreaTier, AreasContent['catalog']> {
  return {
    prime: areas.catalog.filter((a) => a.tier === 'prime'),
    mid: areas.catalog.filter((a) => a.tier === 'mid'),
    emerging: areas.catalog.filter((a) => a.tier === 'emerging'),
  }
}

export function areaTierFrom(
  name: string,
  areas: AreasContent,
): AreaTier | undefined {
  return areas.catalog.find(
    (a) => a.name.toLowerCase() === name.toLowerCase(),
  )?.tier
}

export function defaultViewing(): ViewingContent {
  return DEFAULT_VIEWING
}
