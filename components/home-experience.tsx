'use client'

import { useMemo, useState } from 'react'
import {
  filterProperties,
  type ListingMode,
  type Property,
  type PropertyCategory,
  type UseClass,
} from '@/lib/properties'
import { RoofMark } from './roof-mark'
import { PropertyCard } from './property-card'
import { useFavorites } from '@/lib/favorites'

export interface Filters {
  area: string
  listingMode: ListingMode | 'all'
  category: PropertyCategory | 'all'
  useClass: UseClass | 'all'
  kind: string | 'all'
  minBedrooms: number
  maxPriceUgx: number
  sort: 'newest' | 'price-asc' | 'price-desc'
}

const DEFAULTS: Filters = {
  area: 'all',
  listingMode: 'all',
  category: 'all',
  useClass: 'all',
  kind: 'all',
  minBedrooms: 0,
  maxPriceUgx: 0,
  sort: 'newest',
}

const CHIPS: { key: string; label: string }[] = [
  { key: 'all', label: 'All listings' },
  { key: 'rent', label: 'For rent' },
  { key: 'sale', label: 'For sale' },
  { key: 'residential', label: 'Residential' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'land', label: 'Land' },
  { key: 'beds3', label: '3+ beds' },
]

export function HomeExperience({
  properties,
}: {
  properties: Property[]
  areas?: string[]
}) {
  const [filters, setFiltersState] = useState<Filters>(DEFAULTS)
  const [activeChip, setActiveChip] = useState('all')
  const { favorites, toggleFav } = useFavorites()

  function setFilters(next: Partial<Filters>) {
    setFiltersState((prev) => ({ ...prev, ...next }))
  }

  function applyChip(key: string) {
    setActiveChip(key)
    const base: Partial<Filters> = {
      listingMode: 'all',
      kind: 'all',
      category: 'all',
      useClass: 'all',
      minBedrooms: 0,
    }
    if (key === 'rent' || key === 'sale') base.listingMode = key
    else if (key === 'beds3') base.minBedrooms = 3
    else if (key === 'land') {
      base.category = 'land'
    } else if (key === 'residential' || key === 'commercial') {
      base.category = 'property'
      base.useClass = key
    }
    setFilters(base)
  }

  const filtered = useMemo(() => {
    let list = filterProperties(properties, {
      listingMode: filters.listingMode,
      category: filters.category,
      useClass: filters.useClass,
      area: filters.area,
      kind: filters.kind,
      minBedrooms: filters.minBedrooms,
      maxPriceUgx: filters.maxPriceUgx,
    })

    if (filters.sort === 'price-asc') {
      list = [...list].sort((a, b) => a.priceUgx - b.priceUgx)
    }
    if (filters.sort === 'price-desc') {
      list = [...list].sort((a, b) => b.priceUgx - a.priceUgx)
    }
    if (filters.sort === 'newest') {
      list = [...list].sort((a, b) => b.listedAt.localeCompare(a.listedAt))
    }
    return list
  }, [filters, properties])

  return (
    <>
      <section id="listings" className="px-5 pb-24 pt-10 sm:px-7 sm:pt-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
                Available now
              </h2>
              <p className="mt-1 text-[15px] text-neutral-muted">
                {filtered.length} listing{filtered.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sortSelect"
                className="text-sm font-semibold text-neutral-muted"
              >
                Sort
              </label>
              <select
                id="sortSelect"
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ sort: e.target.value as Filters['sort'] })
                }
                className="cursor-pointer rounded-full border border-neutral-light bg-surface px-4 py-2 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2.5">
            {CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => applyChip(chip.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeChip === chip.key
                    ? 'border-primary bg-primary text-white'
                    : 'border-neutral-light bg-surface text-neutral-muted hover:border-neutral-muted hover:text-ink'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-neutral-muted">
              <RoofMark className="mx-auto mb-3.5 h-9 w-9 text-neutral-muted" />
              <h3 className="text-2xl font-extrabold text-ink">
                No listings match those filters
              </h3>
              <p className="mt-1.5">Try a different town or clear a filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filtered.map((item, i) => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  index={i}
                  isFav={favorites.has(item.id)}
                  onToggleFav={toggleFav}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
