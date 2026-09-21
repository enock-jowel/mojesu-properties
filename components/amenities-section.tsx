'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AMENITY_PREVIEW_COUNT } from '@/lib/amenities'
import { useResolveAmenities } from '@/components/site-catalog-provider'

const MOBILE_PAGE_SIZE = 6 // 3 columns × 2 rows

function chunkAmenities<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}

function AmenityCell({
  iconClass,
  label,
  compact,
}: {
  iconClass: string
  label: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <li className="flex flex-col items-center gap-1.5 text-center">
        <span
          className="amenity-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pill-soft text-accent-deep"
          aria-hidden
        >
          <i className={`${iconClass} text-[16px] leading-none`} />
        </span>
        <span className="line-clamp-2 text-[12px] font-medium leading-tight text-ink">
          {label}
        </span>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3.5 text-[15px] text-ink">
      <span
        className="amenity-icon inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pill-soft text-accent-deep"
        aria-hidden
      >
        <i className={`${iconClass} text-[18px] leading-none`} />
      </span>
      <span className="font-medium">{label}</span>
    </li>
  )
}

/**
 * Flat Airbnb-style amenities.
 * Mobile: 2×3 pages with horizontal carousel + prev/next buttons.
 * sm+: static grid.
 */
export function AmenitiesSection({ amenities }: { amenities: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const resolved = useResolveAmenities(amenities)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const pages = useMemo(
    () => chunkAmenities(resolved, MOBILE_PAGE_SIZE),
    [resolved],
  )

  const desktopVisible = expanded
    ? resolved
    : resolved.slice(0, AMENITY_PREVIEW_COUNT)
  const hasMore = resolved.length > AMENITY_PREVIEW_COUNT

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [updateArrows, pages.length])

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  if (resolved.length === 0) return null

  return (
    <section className="mt-6 sm:mt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-ink sm:text-lg">
          What this place offers
        </h2>
        {pages.length > 1 ? (
          <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
            <button
              type="button"
              aria-label="Previous amenities"
              disabled={!canPrev}
              onClick={() => scrollByPage(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-light bg-surface text-ink transition-colors enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-3 w-3 stroke-[3]" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next amenities"
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-light bg-surface text-ink transition-colors enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="h-3 w-3 stroke-[3]" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {/* Mobile: pages of 2 rows × 3 cols */}
      <div
        ref={scrollerRef}
        className="allow-x-scroll mt-3 flex max-w-full snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, pageIdx) => (
          <ul
            key={pageIdx}
            className="grid w-full shrink-0 snap-start grid-cols-3 grid-rows-2 gap-x-3 gap-y-3"
          >
            {page.map((a) => (
              <AmenityCell
                key={a.key}
                iconClass={a.iconClass}
                label={a.label}
                compact
              />
            ))}
          </ul>
        ))}
      </div>

      {/* Desktop / tablet grid */}
      <ul className="mt-5 hidden grid-cols-1 gap-y-4 sm:grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
        {desktopVisible.map((a) => (
          <AmenityCell
            key={a.key}
            iconClass={a.iconClass}
            label={a.label}
          />
        ))}
      </ul>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-5 hidden text-sm font-bold text-primary hover:text-primary-dark sm:inline"
        >
          {expanded
            ? 'Show less'
            : `Show all ${resolved.length} amenities`}
        </button>
      ) : null}
    </section>
  )
}
