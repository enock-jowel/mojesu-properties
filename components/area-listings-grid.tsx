'use client'

import { PropertyCard } from '@/components/property-card'
import type { PropertyCardData } from '@/lib/property-card-data'

export function AreaListingsGrid({ items }: { items: PropertyCardData[] }) {
  return (
    <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, i) => (
        <PropertyCard
          key={item.id}
          item={item}
          index={i}
        />
      ))}
    </div>
  )
}
