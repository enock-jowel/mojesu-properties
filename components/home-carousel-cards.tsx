'use client'

import type { PropertyCardData } from '@/lib/property-card-data'
import { CAROUSEL_CARD_WIDTH } from '@/components/carousel-see-more-card'
import { PropertyCard } from '@/components/property-card'

export function HomeCarouselCards({ items }: { items: PropertyCardData[] }) {
  if (items.length === 0) {
    return (
      <p className="px-1 py-6 text-sm text-neutral-muted">
        No listings in this row yet.
      </p>
    )
  }

  return (
    <>
      {items.slice(0, 8).map((item, i) => (
        <div
          key={item.id}
          className={`${CAROUSEL_CARD_WIDTH}${i >= 4 ? ' max-sm:hidden' : ''}`}
        >
          <PropertyCard
            item={item}
            index={i}
            compact
          />
        </div>
      ))}
    </>
  )
}
