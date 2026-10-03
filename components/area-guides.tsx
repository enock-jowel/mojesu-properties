import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import { AreaListingsGrid } from '@/components/area-listings-grid'
import { RoofMark } from '@/components/roof-mark'
import { AREA_TIER_LABEL, type AreaTier } from '@/lib/areas'
import {
  AREA_GUIDES,
  AREAS_INDEX_FAQS,
  TIER_GUIDES,
  type AreaGuide,
  type GuideFaq,
} from '@/lib/area-guides'
import { responsiveImg } from '@/lib/media'
import {
  formatPriceUgx,
  getCoverImage,
  imageUrl,
  type Property,
} from '@/lib/properties'
import type { PropertyCardData } from '@/lib/property-card-data'

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=60'

const TIER_ORDER: AreaTier[] = ['prime', 'mid', 'emerging']

export type AreaStats = {
  items: Property[]
  rent: number
  sale: number
  land: number
  cover: { src: string; alt: string } | null
}

/** Live counts + cover photo for an area, from published listings only. */
export function areaStats(properties: Property[], areaName: string): AreaStats {
  const items = properties
    .filter((p) => p.area === areaName)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  const withPhoto = items.find((p) => getCoverImage(p.images))
  const img = withPhoto ? getCoverImage(withPhoto.images) : undefined
  return {
    items,
    rent: items.filter((p) => p.category === 'property' && p.listingMode === 'rent').length,
    sale: items.filter((p) => p.category === 'property' && p.listingMode === 'sale').length,
    land: items.filter((p) => p.category === 'land').length,
    cover: img ? { src: imageUrl(img), alt: img.alt || withPhoto!.title } : null,
  }
}

export function countLabel(stats: AreaStats): string {
  const parts = [
    stats.rent ? `${stats.rent} to rent` : '',
    stats.sale ? `${stats.sale} for sale` : '',
    stats.land ? `${stats.land} plot${stats.land === 1 ? '' : 's'}` : '',
  ].filter(Boolean)
  return parts.join(' · ')
}

function priceRange(items: Property[]): string | null {
  if (!items.length) return null
  const prices = items.map((p) => p.priceUgx).filter((n) => n > 0)
  if (!prices.length) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPriceUgx(min) : `${formatPriceUgx(min)} – ${formatPriceUgx(max)}`
}

/** Facts from our own live listings — never market-wide claims. */
function listingFacts(name: string, stats: AreaStats): string | null {
  const pick = (mode: 'rent' | 'sale', residential: boolean) =>
    stats.items.filter(
      (p) =>
        p.category === 'property' &&
        p.listingMode === mode &&
        (p.useClass === 'residential') === residential,
    )
  const groups: [Property[], string][] = [
    [pick('rent', true), 'homes to rent at %s per month'],
    [pick('sale', true), 'homes for sale at %s'],
    [pick('rent', false), 'commercial space to rent at %s per month'],
    [pick('sale', false), 'commercial property for sale at %s'],
    [stats.items.filter((p) => p.category === 'land'), 'plots at %s'],
  ]
  const parts = groups
    .map(([items, phrase]) => {
      const range = priceRange(items)
      return range ? phrase.replace('%s', range) : ''
    })
    .filter(Boolean)
  if (!parts.length) return null
  return `Mojesu currently lists ${parts.join('; ')} in ${name}.`
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-muted/70">
      {children}
    </p>
  )
}

/** Native <details> accordion — same pattern as the About FAQ, no client JS. */
export function GuideFaqSection({
  faqs,
  title,
  body,
}: {
  faqs: GuideFaq[]
  title: string
  body: string
}) {
  if (!faqs.length) return null
  return (
    <section className="bg-background py-16 sm:py-20" aria-labelledby="area-faq-heading">
      <div className="site-container grid w-full gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-muted">
            QUESTIONS
          </p>
          <h2
            id="area-faq-heading"
            className="mt-3 max-w-sm text-3xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-muted">{body}</p>
          <ArrowPillLink href="/services/agent-search/" variant="dark" size="lg" className="mt-6">
            Get an agent
          </ArrowPillLink>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <details
              key={faq.question}
              name="area-faq"
              className="group border-b border-black/[0.08]"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [-webkit-tap-highlight-color:transparent] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-[15px] font-semibold text-ink sm:text-base">
                  {faq.question}
                </span>
                <span
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-neutral-muted transition-transform duration-300 group-open:rotate-180"
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pr-8 text-[14.5px] leading-relaxed text-neutral-muted sm:text-[15px]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function AreaCard({ guide, stats }: { guide: AreaGuide; stats: AreaStats }) {
  const total = stats.items.length
  return (
    <Link href={`/areas/${guide.slug}/`} className="group block text-left">
      <div className="relative aspect-[1/0.92] overflow-hidden rounded-2xl bg-surface-alt sm:aspect-[16/11]">
        {stats.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...responsiveImg(stats.cover.src, [320, 480, 640], '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px')}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <RoofMark className="h-10 w-10 text-neutral-muted/40" />
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-pill-soft-mid px-2.5 py-0.5 text-[10px] font-bold leading-none text-ink sm:left-3 sm:top-3 sm:text-[11px]">
          {total ? `${total} listing${total === 1 ? '' : 's'}` : 'Area guide'}
        </span>
      </div>
      <div className="pt-3">
        <h3 className="truncate text-[15.5px] font-bold leading-tight text-ink transition-colors group-hover:text-primary-dark">
          {guide.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-muted">
          {guide.summary}
        </p>
        {total ? (
          <p className="mt-1.5 truncate text-[12.5px] font-semibold text-ink/80">
            {countLabel(stats)}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export function AreasIndex({ properties }: { properties: Property[] }) {
  return (
    <>
      <header className="bg-surface-alt px-4 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-4 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            Neighbourhoods
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Kampala neighbourhood guides
          </h1>
          <p className="max-w-[640px] text-pretty text-[15px] leading-relaxed text-neutral-muted sm:text-base">
            What each area is like, who it suits, and the homes and plots we have there right
            now — from prime hills to emerging corridors.
          </p>
          <nav aria-label="Market tiers" className="mt-2 flex flex-wrap justify-center gap-2">
            {TIER_ORDER.map((tier) => (
              <a
                key={tier}
                href={`#${tier}`}
                className="rounded-full bg-background px-4 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-inset ring-neutral-light transition-colors hover:bg-pill-soft hover:ring-primary/30"
              >
                {AREA_TIER_LABEL[tier]}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {TIER_ORDER.map((tier, t) => {
        const tierGuide = TIER_GUIDES.find((g) => g.tier === tier)
        const guides = AREA_GUIDES.filter((g) => g.tier === tier)
        return (
          <section
            key={tier}
            id={tier}
            aria-labelledby={`tier-${tier}`}
            className={`site-container scroll-mt-24 ${t === 0 ? 'pt-12 sm:pt-16' : 'pt-14 sm:pt-20'}`}
          >
            <div className="flex max-w-[44rem] flex-col gap-2">
              <SectionEyebrow>{AREA_TIER_LABEL[tier]}</SectionEyebrow>
              <h2
                id={`tier-${tier}`}
                className="text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl"
              >
                {tierGuide?.title ?? `${AREA_TIER_LABEL[tier]} areas`}
              </h2>
              {tierGuide ? (
                <p className="text-[15px] leading-relaxed text-neutral-muted">{tierGuide.summary}</p>
              ) : null}
            </div>
            <ul className="mt-7 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <AreaCard guide={guide} stats={areaStats(properties, guide.name)} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <div className="mt-6 sm:mt-10">
        <GuideFaqSection
          faqs={AREAS_INDEX_FAQS}
          title="Choosing where to live in Kampala."
          body="Quick answers on neighbourhoods, market tiers and buying land around the city."
        />
      </div>
    </>
  )
}

export function AreaGuideView({
  guide,
  stats,
  cards,
  neighbours,
}: {
  guide: AreaGuide
  stats: AreaStats
  cards: PropertyCardData[]
  neighbours: AreaGuide[]
}) {
  const tierLabel = AREA_TIER_LABEL[guide.tier]
  const q = encodeURIComponent(guide.name)
  const facts = listingFacts(guide.name, stats)
  const heroSrc = stats.cover?.src ?? FALLBACK_HERO
  const chips = [
    stats.items.length
      ? `${stats.items.length} live listing${stats.items.length === 1 ? '' : 's'}`
      : '',
    stats.rent ? `${stats.rent} to rent` : '',
    stats.sale ? `${stats.sale} for sale` : '',
    stats.land ? `${stats.land} plot${stats.land === 1 ? '' : 's'}` : '',
  ].filter(Boolean)

  const browse = [
    { label: 'To rent', href: `/rent/?location=${q}`, count: stats.rent },
    { label: 'For sale', href: `/buy/?location=${q}`, count: stats.sale },
    { label: 'Land & plots', href: `/land/?location=${q}`, count: stats.land },
  ]

  return (
    <article className="w-full max-w-full">
      <header className="relative flex min-h-[340px] w-full max-w-full items-end overflow-hidden sm:min-h-[400px] lg:min-h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...responsiveImg(heroSrc, [640, 1080, 1600], '100vw')}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-accent-deep/85 via-accent-deep/55 to-accent-deep/25"
          aria-hidden
        />
        <div className="relative z-[1] w-full max-w-full overflow-hidden pb-10 pt-28 sm:pb-12 sm:pt-32 lg:pb-14 lg:pt-36">
          <div className="site-container flex w-full min-w-0 flex-col items-start gap-3.5">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-white/80"
            >
              <Link href="/areas/" className="transition-colors hover:text-white">
                All areas
              </Link>
              <span aria-hidden="true">&gt;</span>
              <Link href={`/areas/#${guide.tier}`} className="transition-colors hover:text-white">
                {tierLabel}
              </Link>
            </nav>

            <div className="h-px w-full max-w-[800px] bg-white/20" aria-hidden />

            <div className="flex w-full min-w-0 max-w-[800px] flex-col gap-3.5">
              <h1 className="w-full max-w-full text-balance break-words text-[1.85rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                Homes &amp; land in {guide.name}
              </h1>
              <p className="max-w-full text-pretty text-[15px] leading-relaxed text-white/90 sm:text-base">
                {guide.summary}
              </p>
              {chips.length ? (
                <ul className="mt-1 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/35 backdrop-blur-sm"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <section className="pb-4 pt-14 sm:pt-20">
        <div className="site-container flex w-full flex-col items-start gap-12 lg:flex-row lg:gap-20">
          <div className="flex min-w-0 flex-1 flex-col gap-12">
            <section
              aria-labelledby="area-answer-heading"
              className="rounded-2xl border border-primary/15 bg-pill-soft px-5 py-5 sm:px-6 sm:py-6"
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                In short
              </p>
              <h2
                id="area-answer-heading"
                className="mt-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
              >
                Living in {guide.name}
              </h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink sm:text-base">
                {guide.summary}
              </p>
              {facts ? (
                <p className="mt-2 text-[14px] leading-relaxed text-neutral-muted">{facts}</p>
              ) : null}
            </section>

            <section aria-labelledby="area-about-heading" className="flex flex-col gap-5">
              <SectionEyebrow>{tierLabel} neighbourhood</SectionEyebrow>
              <h2
                id="area-about-heading"
                className="max-w-[40rem] text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
              >
                What to know about {guide.name}
              </h2>
              <div className="flex max-w-[40rem] flex-col gap-4 text-[15px] leading-relaxed text-neutral-muted sm:text-base">
                {guide.body.map((para) => (
                  <p key={para.slice(0, 48)}>{para}</p>
                ))}
              </div>
              {guide.highlights.length ? (
                <ul className="flex flex-wrap gap-2">
                  {guide.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-full bg-pill-soft px-3 py-1 text-[12px] font-semibold text-secondary"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>

          <aside className="flex w-full flex-col gap-8 lg:sticky lg:top-24 lg:w-[340px] lg:shrink-0">
            <div className="flex w-full flex-col gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-muted/80">
                Browse {guide.name}
              </p>
              <ul className="flex flex-col gap-2.5">
                {browse.map((b) => (
                  <li key={b.href}>
                    <Link
                      href={b.href}
                      className="flex items-center justify-between gap-3 rounded-[10px] bg-surface-alt px-5 py-4 transition-colors hover:bg-neutral-light/40"
                    >
                      <span className="text-[15px] font-semibold text-ink">{b.label}</span>
                      <span className="flex items-center gap-2">
                        {b.count ? (
                          <span className="rounded-full bg-background px-2 py-0.5 text-[12px] font-bold text-ink">
                            {b.count}
                          </span>
                        ) : null}
                        <ChevronRight className="h-5 w-5 shrink-0 text-ink/70" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {neighbours.length ? (
              <div className="flex w-full flex-col gap-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-muted/80">
                  Other {tierLabel.toLowerCase()} areas
                </p>
                <ul className="flex flex-wrap gap-2">
                  {neighbours.map((n) => (
                    <li key={n.slug}>
                      <Link
                        href={`/areas/${n.slug}/`}
                        className="inline-flex rounded-full bg-background px-3.5 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-inset ring-neutral-light transition-colors hover:bg-pill-soft hover:ring-primary/30"
                      >
                        {n.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section aria-labelledby="area-listings-heading" className="site-container pt-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <SectionEyebrow>On Mojesu now</SectionEyebrow>
            <h2
              id="area-listings-heading"
              className="text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl"
            >
              Listings in {guide.name}
            </h2>
          </div>
          {stats.items.length ? (
            <ArrowPillLink
              href={stats.rent ? `/rent/?location=${q}` : stats.sale ? `/buy/?location=${q}` : `/land/?location=${q}`}
              variant="primary"
              size="md"
            >
              Filter & compare
            </ArrowPillLink>
          ) : null}
        </div>

        {stats.items.length ? (
          <AreaListingsGrid items={cards} />
        ) : (
          <div className="mt-6 rounded-2xl bg-surface-alt px-6 py-14 text-center">
            <RoofMark className="mx-auto mb-3.5 h-9 w-9 text-neutral-muted" />
            <h3 className="text-xl font-extrabold text-ink">
              No live listings in {guide.name} right now
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-[15px] text-neutral-muted">
              New homes arrive every week. Browse nearby {tierLabel.toLowerCase()} areas, or ask
              an agent to search for you.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <ArrowPillLink href={`/rent/?tier=${guide.tier}`} variant="primary" size="md">
                {tierLabel} rentals
              </ArrowPillLink>
              <ArrowPillLink href="/services/agent-search/" variant="light" size="md" className="ring-1 ring-inset ring-neutral-light">
                Get an agent
              </ArrowPillLink>
            </div>
          </div>
        )}
      </section>

      <div className="mt-8 sm:mt-12">
        <GuideFaqSection
          faqs={guide.faqs}
          title={`Questions about ${guide.name}.`}
          body={`Straight answers about living, renting and buying in ${guide.name}.`}
        />
      </div>
    </article>
  )
}
