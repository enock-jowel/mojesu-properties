'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CarouselSeeMoreCard, type SeeMorePreview } from '@/components/carousel-see-more-card'

export function ListingCarouselRow({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = 'Show more',
  seeAllPreviews = [],
  children,
}: {
  title: string
  subtitle?: string
  seeAllHref: string
  /** Label on the end-of-row card */
  seeAllLabel?: string
  /** Cover images for the fanned “Show more” card */
  seeAllPreviews?: SeeMorePreview[]
  children: React.ReactNode
}) {
  const labelId = useId()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

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
  }, [updateArrows, children])

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section
      className="mb-10 sm:mb-12"
      aria-labelledby={labelId}
      role="group"
    >
      <div className="site-container mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={seeAllHref}
            id={labelId}
            className="group inline-flex max-w-full items-center gap-2 text-ink transition-colors hover:text-primary-dark"
          >
            <h2 className="truncate text-xl font-semibold sm:text-2xl">
              {title}
            </h2>
            <ChevronRight
              className="h-4 w-4 shrink-0 stroke-[2.5] text-ink transition-transform group-hover:translate-x-0.5 group-hover:text-primary-dark"
              aria-hidden="true"
            />
          </Link>
          {subtitle && (
            <p className="mt-0.5 text-sm text-neutral-muted">{subtitle}</p>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-light bg-surface text-ink transition-colors hover:border-neutral-muted enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-3 w-3 stroke-[3]" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-light bg-surface text-ink transition-colors hover:border-neutral-muted enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-3 w-3 stroke-[3]" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="carousel-track-shell">
        <div
          ref={scrollerRef}
          className="carousel-track gap-3 pb-1 sm:gap-4"
        >
          {children}
          <CarouselSeeMoreCard
            href={seeAllHref}
            label={seeAllLabel}
            previews={seeAllPreviews}
          />
        </div>
      </div>
    </section>
  )
}
