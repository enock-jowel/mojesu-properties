'use client'

import { useState } from 'react'
import type { PropertyCardData } from '@/lib/property-card-data'
import { CAROUSEL_CARD_WIDTH } from '@/components/carousel-see-more-card'
import { PropertyCard } from '@/components/property-card'

export function HomeCarouselCards({ items }: { items: PropertyCardData[] }) {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
            isFav={favorites.has(item.id)}
            onToggleFav={toggleFav}
          />
        </div>
      ))}
    </>
  )
}
