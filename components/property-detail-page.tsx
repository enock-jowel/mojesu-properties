'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  formatPriceUgx,
  priceSuffix,
  type Property,
} from '@/lib/properties'
import { AmenitiesSection } from '@/components/amenities-section'
import { PropertyGallery } from '@/components/property-gallery'
import { ThingsToKnowSection } from '@/components/things-to-know-section'
import { ViewingStickyCard } from '@/components/viewing-sticky-card'
import { PropertyCard } from '@/components/property-card'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import {
  useListingKindLabel,
  useTaxonomy,
} from '@/components/site-catalog-provider'
import { useFavorites } from '@/lib/favorites'
import { getAreaGuideByName, getTierGuide } from '@/lib/area-guides'

const DESC_COLLAPSE_CHARS = 320

/**
 * Full listing detail UI — routed `/listings/[slug]` page only (not a modal).
 */
export function PropertyDetailPage({
  item,
  similar = [],
}: {
  item: Property
  similar?: Property[]
}) {
  const [descOpen, setDescOpen] = useState(false)
  const { favorites, toggleFav } = useFavorites()
  const [viewingOpen, setViewingOpen] = useState(false)
  const kindLabel = useListingKindLabel(item)
  const { titleStatus } = useTaxonomy()

  const descLong = item.description.length > DESC_COLLAPSE_CHARS
  const descShown =
    descOpen || !descLong
      ? item.description
      : `${item.description.slice(0, DESC_COLLAPSE_CHARS).trim()}…`

  const browseHref =
    item.listingMode === 'rent'
      ? '/rent/'
      : item.category === 'land'
        ? '/land/'
        : '/buy/'

  const areaGuide = getAreaGuideByName(item.area)
  const tierGuide = getTierGuide(item.areaTier)

  return (
    <article className="site-container pb-28 pt-5 sm:pt-12 lg:pb-12">
      <p className="mb-3 text-sm text-neutral-muted sm:mb-5">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        {' / '}
        <Link href={browseHref} className="hover:text-ink">
          {item.listingMode === 'rent'
            ? 'For rent'
            : item.category === 'land'
              ? 'Land'
              : 'For sale'}
        </Link>
        {' / '}
        <span className="text-ink">{item.title}</span>
      </p>

      <PropertyGallery item={item} />

      {/* Content + sticky booking: sticky stops at end of this grid row */}
      <div className="mt-4 grid gap-6 sm:mt-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold leading-none sm:px-3 sm:py-1 sm:text-xs ${
                item.listingMode === 'rent'
                  ? 'bg-pill-soft-mid text-ink'
                  : 'bg-pill-soft text-secondary'
              }`}
            >
              {item.listingMode === 'rent' ? 'For rent' : 'For sale'}
            </span>
            {item.listingMode === 'sale' && item.titleStatus ? (
              <span className="rounded-full bg-pill-title-status px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-secondary sm:px-3 sm:py-1 sm:text-xs">
                {titleStatus[item.titleStatus] || item.titleStatus}
              </span>
            ) : null}
            {item.verified ? (
              <span className="rounded-full bg-pill-soft-cool px-2 py-0.5 text-[10px] font-bold leading-none text-accent-deep sm:px-3 sm:py-1 sm:text-xs">
                Verified
              </span>
            ) : null}
          </div>

          <h1 className="mt-2 text-xl font-extrabold leading-snug text-ink sm:mt-3 sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-muted sm:mt-2 sm:text-[15px]">
            {kindLabel} · {item.area}, {item.city}
            {areaGuide ? (
              <>
                {' · '}
                <Link
                  href={`/areas/${areaGuide.slug}/`}
                  className="font-semibold text-primary-dark underline-offset-2 hover:underline"
                >
                  Area guide
                </Link>
              </>
            ) : tierGuide ? (
              <>
                {' · '}
                <Link
                  href={`/areas/tier/${tierGuide.slug}/`}
                  className="font-semibold text-primary-dark underline-offset-2 hover:underline"
                >
                  {tierGuide.title}
                </Link>
              </>
            ) : null}
          </p>
          {item.updatedAt ? (
            <p className="mt-1 text-[12px] text-neutral-muted/80">
              Updated{' '}
              <time dateTime={item.updatedAt}>
                {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </p>
          ) : null}

          {item.listingMode === 'sale' && item.titleStatus ? (
            <p className="mt-3 rounded-xl border border-primary/15 bg-pill-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-ink sm:text-sm">
              <span className="font-bold">
                Title status: {titleStatus[item.titleStatus] || item.titleStatus}.
              </span>{' '}
              Mojesu lists tenure clearly (freehold, mailo, leasehold, customary,
              or kibanja) so buyers know the ownership type before they book a
              viewing — we do not treat title as a hidden footnote.
            </p>
          ) : item.verified ? (
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-muted sm:text-sm">
              Verified listing — Mojesu has confirmed the key facts for this
              property before it went live.
            </p>
          ) : null}

          <div className="mt-3 flex flex-nowrap items-center justify-between gap-2 overflow-hidden border-y border-neutral-light py-3 sm:mt-6 sm:gap-8 sm:py-5">
            <QuickSpecs item={item} />
          </div>

          {/* Mobile: price left + Book a viewing right (floating bar also stays) */}
          <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold text-ink">
                {formatPriceUgx(item.priceUgx)}
                {priceSuffix(item) ? (
                  <span className="text-sm font-medium text-neutral-muted">
                    {' '}
                    {priceSuffix(item)}
                  </span>
                ) : null}
              </p>
              {item.priceNegotiable ? (
                <span className="mt-1 inline-block rounded-full bg-pill-soft px-2 py-0.5 text-[10px] font-bold leading-none text-secondary">
                  Negotiable
                </span>
              ) : null}
            </div>
            <ArrowPillButton
              onClick={() => setViewingOpen(true)}
              size="sm"
              className="shrink-0"
            >
              Book a viewing
            </ArrowPillButton>
          </div>

          <section className="mt-5 sm:mt-8">
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              About this listing
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-muted sm:mt-3 sm:text-[15px]">
              {descShown}
            </p>
            {descLong ? (
              <button
                type="button"
                onClick={() => setDescOpen((o) => !o)}
                className="mt-1.5 text-sm font-bold text-primary hover:text-primary-dark sm:mt-2"
              >
                {descOpen ? 'Show less' : 'Read more'}
              </button>
            ) : null}
          </section>

          <AmenitiesSection amenities={item.amenities ?? []} />
        </div>

        <ViewingStickyCard
          item={item}
          mobileOpen={viewingOpen}
          onMobileOpenChange={setViewingOpen}
        />
      </div>

      <ThingsToKnowSection item={item} />

      {similar.length > 0 ? (
        <section className="mt-8 border-t border-neutral-light pt-6 sm:mt-14 sm:pt-10">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            Similar listings
          </h2>
          <p className="mt-1 text-sm text-neutral-muted">
            More in {item.area} and nearby
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {similar.slice(0, 5).map((p, i) => (
              <PropertyCard
                key={p.id}
                item={p}
                index={i}
                isFav={favorites.has(p.id)}
                onToggleFav={toggleFav}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

function QuickSpecs({ item }: { item: Property }) {
  const kindLabel = useListingKindLabel(item)

  if (item.category === 'land') {
    return (
      <Spec
        iconClass="fi fi-sr-ruler-combined"
        num={item.plotDimensions}
        lbl="Plot size"
      />
    )
  }
  if (item.useClass === 'commercial' || item.useClass === 'industrial' || item.useClass === 'mixed-use') {
    return (
      <>
        <Spec
          iconClass="fi fi-sr-expand"
          num={`${item.sizeSqm} m²`}
          lbl="Floor area"
        />
        <Spec
          iconClass="fi fi-sr-building"
          num={kindLabel}
          lbl="Unit type"
        />
      </>
    )
  }
  return (
    <>
      <Spec iconClass="fi fi-sr-bed" num={item.bedrooms} lbl="Bedrooms" />
      <Spec iconClass="fi fi-sr-bath" num={item.bathrooms} lbl="Bathrooms" />
      <Spec
        iconClass="fi fi-sr-expand"
        num={`${item.sizeSqm} m²`}
        lbl="Floor area"
      />
    </>
  )
}

function Spec({
  iconClass,
  num,
  lbl,
}: {
  iconClass: string
  num: string | number
  lbl: string
}) {
  return (
    <div className="flex min-w-0 shrink items-center gap-1.5 whitespace-nowrap sm:gap-3">
      <span
        className="amenity-icon inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pill-soft text-accent-deep sm:h-10 sm:w-10"
        aria-hidden
      >
        <i className={`${iconClass} text-[15px] leading-none sm:text-[18px]`} />
      </span>
      <div className="flex min-w-0 flex-col gap-0 sm:gap-0.5">
        <span className="text-sm font-bold leading-tight text-ink sm:text-lg">
          {num}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-neutral-muted sm:text-[12.5px]">
          {lbl}
        </span>
      </div>
    </div>
  )
}
