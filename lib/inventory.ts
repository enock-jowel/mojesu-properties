import type { Property } from '@/lib/properties'

export type InventoryMain = 'rent' | 'buy' | 'land'

/**
 * Compact keys describing which public categories currently have published
 * listings, e.g. `rent`, `rent|commercial`, `rent|residential|kind:apartment`,
 * `land|kind:residential-plot`, `land|title:freehold`, `featured`.
 * Sent to the client so empty categories can be hidden without the catalog.
 */
export function inventoryKeys(properties: Property[]): string[] {
  const keys = new Set<string>()
  for (const p of properties) {
    if (p.status !== 'published') continue
    if (p.isFeatured) keys.add('featured')
    if (p.category === 'land') {
      keys.add('land')
      keys.add(`land|kind:${p.landKind}`)
      if (p.titleStatus) keys.add(`land|title:${p.titleStatus}`)
      continue
    }
    const main: InventoryMain = p.listingMode === 'rent' ? 'rent' : 'buy'
    keys.add(main)
    keys.add(`${main}|${p.useClass}`)
    keys.add(`${main}|${p.useClass}|kind:${p.kind}`)
    if (p.listingMode === 'sale' && p.titleStatus) keys.add(`buy|title:${p.titleStatus}`)
  }
  return [...keys]
}

export type Inventory = {
  hasMain: (main: InventoryMain) => boolean
  hasSub: (main: InventoryMain, sub: string) => boolean
  hasType: (main: InventoryMain, sub: string, value: string) => boolean
  hasFeatured: boolean
}

/** Unknown inventory (null) shows everything — never hide UI on missing data. */
export function inventoryFrom(keys: string[] | null): Inventory {
  if (!keys) {
    return { hasMain: () => true, hasSub: () => true, hasType: () => true, hasFeatured: true }
  }
  const set = new Set(keys)
  return {
    hasMain: (main) => set.has(main),
    hasSub: (main, sub) => (main === 'land' ? set.has('land') : set.has(`${main}|${sub}`)),
    hasType: (main, sub, value) =>
      main === 'land'
        ? set.has(`land|kind:${value}`) || set.has(`land|title:${value}`)
        : set.has(`${main}|${sub}|kind:${value}`),
    hasFeatured: set.has('featured'),
  }
}
