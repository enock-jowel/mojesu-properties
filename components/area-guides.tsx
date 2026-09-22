import Link from 'next/link'
import { AREA_TIER_LABEL, type AreaTier } from '@/lib/areas'
import {
  AREA_GUIDES,
  TIER_GUIDES,
  getTierGuide,
  type AreaGuide,
  type TierGuide,
} from '@/lib/area-guides'

export function browseRentHref(areaName: string) {
  return `/rent/?location=${encodeURIComponent(areaName)}`
}

export function browseBuyHref(areaName: string) {
  return `/buy/?location=${encodeURIComponent(areaName)}`
}

export function browseLandHref(areaName: string) {
  return `/land/?location=${encodeURIComponent(areaName)}`
}

export function browseTierHref(tier: AreaTier, mode: 'rent' | 'buy' | 'land') {
  const base = mode === 'rent' ? '/rent/' : mode === 'land' ? '/land/' : '/buy/'
  return `${base}?tier=${tier}`
}

export function AreasIndex({
  eyebrow = 'Neighbourhoods',
  title = 'Kampala area guides',
  body = 'Local context for prime, mid-market, and emerging corridors — then jump straight into live Rent, Buy, or Land filters.',
}: {
  eyebrow?: string
  title?: string
  body?: string
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="bg-surface-alt px-4 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-4 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          <p className="max-w-[640px] text-pretty text-[15px] leading-relaxed text-neutral-muted sm:text-base">
            {body}
          </p>
        </div>
      </header>

      <section className="site-container py-10 sm:py-14">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Browse by market tier
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {TIER_GUIDES.map((tier) => (
            <li key={tier.slug}>
              <Link
                href={`/areas/tier/${tier.slug}/`}
                className="block rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-5 transition-colors hover:border-primary/40 hover:bg-pill-soft"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-accent-deep">
                  {AREA_TIER_LABEL[tier.tier]}
                </p>
                <h3 className="mt-1.5 text-base font-bold text-ink">
                  {tier.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-muted">
                  {tier.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="site-container pb-16 sm:pb-24">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          All neighbourhood guides
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREA_GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/areas/${guide.slug}/`}
                className="flex flex-col rounded-xl border border-neutral-light/70 bg-background px-4 py-3.5 transition-colors hover:border-primary/35 hover:bg-pill-soft"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
                  {AREA_TIER_LABEL[guide.tier]}
                </span>
                <span className="mt-0.5 text-[15px] font-bold text-ink">
                  {guide.name}
                </span>
                <span className="mt-1 line-clamp-2 text-sm text-neutral-muted">
                  {guide.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export function AreaGuideArticle({ guide }: { guide: AreaGuide }) {
  return (
    <article className="site-container max-w-[800px] py-10 sm:py-14">
      <p className="text-sm text-neutral-muted">
        <Link href="/areas/" className="hover:text-ink">
          Areas
        </Link>
        {' / '}
        <Link
          href={`/areas/tier/${getTierGuide(guide.tier)?.slug || guide.tier}/`}
          className="hover:text-ink"
        >
          {AREA_TIER_LABEL[guide.tier]}
        </Link>
        {' / '}
        <span className="text-ink">{guide.name}</span>
      </p>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-wide text-accent-deep">
        {AREA_TIER_LABEL[guide.tier]} neighbourhood
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {guide.name}
      </h1>
      <p className="mt-4 text-pretty text-[15px] leading-relaxed text-neutral-muted sm:text-base">
        {guide.summary}
      </p>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink">
        {guide.body.map((para) => (
          <p key={para.slice(0, 48)}>{para}</p>
        ))}
      </div>

      {guide.highlights.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-2">
          {guide.highlights.map((h) => (
            <li
              key={h}
              className="rounded-full bg-pill-soft px-3 py-1 text-xs font-semibold text-secondary"
            >
              {h}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-light pt-8">
        <GuideCta href={browseRentHref(guide.name)} label="Rent here" />
        <GuideCta href={browseBuyHref(guide.name)} label="Buy here" />
        <GuideCta href={browseLandHref(guide.name)} label="Land here" />
      </div>
    </article>
  )
}

export function TierGuideArticle({
  guide,
  areas,
}: {
  guide: TierGuide
  areas: AreaGuide[]
}) {
  return (
    <article className="site-container py-10 sm:py-14">
      <div className="mx-auto max-w-[800px]">
        <p className="text-sm text-neutral-muted">
          <Link href="/areas/" className="hover:text-ink">
            Areas
          </Link>
          {' / '}
          <span className="text-ink">{AREA_TIER_LABEL[guide.tier]}</span>
        </p>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-neutral-muted sm:text-base">
          {guide.summary}
        </p>

        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink">
          {guide.body.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-light pt-8">
          <GuideCta
            href={browseTierHref(guide.tier, 'rent')}
            label="Rent in this tier"
          />
          <GuideCta
            href={browseTierHref(guide.tier, 'buy')}
            label="Buy in this tier"
          />
          <GuideCta
            href={browseTierHref(guide.tier, 'land')}
            label="Land in this tier"
          />
        </div>
      </div>

      <section className="mx-auto mt-14 max-w-[1000px]">
        <h2 className="text-lg font-extrabold text-ink">
          Neighbourhoods in {AREA_TIER_LABEL[guide.tier].toLowerCase()}
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/areas/${area.slug}/`}
                className="block rounded-xl border border-neutral-light/70 px-4 py-3.5 transition-colors hover:border-primary/35 hover:bg-pill-soft"
              >
                <span className="text-[15px] font-bold text-ink">{area.name}</span>
                <span className="mt-1 block line-clamp-2 text-sm text-neutral-muted">
                  {area.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

function GuideCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
    >
      {label}
    </Link>
  )
}
