'use client'

import { useMemo } from 'react'
import { Star } from 'lucide-react'
import {
  getFeaturedReview,
  getReviewAggregate,
  type Review,
} from '@/lib/reviews'
import type { SectionIntro } from '@/lib/site-content/types'
import { sizedImageUrl } from '@/lib/media'
import { ArrowPillLink } from '@/components/arrow-pill-button'

function formatRating(rating: number): string {
  return rating.toFixed(1)
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TestimonialCard({
  review,
  variant,
}: {
  review: Review
  variant: 'dark' | 'light'
}) {
  const dark = variant === 'dark'
  const avatarSrc = review.avatarUrl ?? review.photoUrl

  return (
    <article
      className={`flex h-full min-h-[200px] flex-col rounded-2xl p-4 sm:min-h-0 sm:p-5 ${
        dark
          ? 'bg-accent-deep text-white shadow-md shadow-accent-deep/20'
          : 'bg-surface text-ink shadow-sm ring-1 ring-black/[0.04]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sizedImageUrl(avatarSrc, 96)}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="h-9 w-9 shrink-0 rounded-full object-cover object-top"
          />
        ) : (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              dark ? 'bg-white/15 text-white' : 'bg-primary/15 text-primary'
            }`}
            aria-hidden="true"
          >
            {initials(review.authorName)}
          </span>
        )}
        <p
          className={`flex flex-wrap items-center gap-1 text-[13px] font-semibold ${
            dark ? 'text-white' : 'text-ink'
          }`}
        >
          <span>{formatRating(review.rating)}</span>
          <Star
            className="h-3 w-3 fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
          <span
            className={`font-medium ${
              dark ? 'text-white/80' : 'text-neutral-muted'
            }`}
          >
            Rating
          </span>
        </p>
      </div>

      <p
        className={`mt-3 line-clamp-3 text-[13.5px] leading-snug sm:text-sm ${
          dark ? 'text-white/95' : 'text-ink'
        }`}
      >
        “{review.quote}”
      </p>

      <div className="mt-auto pt-3">
        <p
          className={`text-[13px] font-bold ${
            dark ? 'text-white' : 'text-ink'
          }`}
        >
          {review.authorName}
        </p>
        <p
          className={`mt-0.5 text-[12px] ${
            dark ? 'text-white/65' : 'text-neutral-muted'
          }`}
        >
          {review.role}
        </p>
      </div>
    </article>
  )
}

function MarqueeCards({ reviews }: { reviews: Review[] }) {
  // Duplicate for a seamless -50% loop
  const loop = useMemo(() => [...reviews, ...reviews], [reviews])

  return (
    <div
      className="relative max-w-full overflow-x-clip"
      aria-label="Client reviews"
    >
      <div className="reviews-marquee-track flex w-max max-w-none gap-3">
        {loop.map((review, i) => (
          <div
            key={`${review.id}-${i}`}
            className="w-[min(78vw,300px)] shrink-0"
            aria-hidden={i >= reviews.length ? true : undefined}
          >
            <TestimonialCard
              review={review}
              variant={i % 2 === 0 ? 'dark' : 'light'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewsSection({
  reviews,
  intro,
  aggregate: aggregateProp,
}: {
  reviews: Review[]
  intro: SectionIntro
  /** Prefer place-level Google aggregate (full review count) when provided */
  aggregate?: { average: number; count: number } | null
}) {
  const featured = useMemo(() => getFeaturedReview(reviews), [reviews])
  const others = useMemo(
    () => reviews.filter((r) => r.id !== featured?.id).slice(0, 4),
    [reviews, featured],
  )
  const aggregate = useMemo(
    () =>
      aggregateProp !== undefined
        ? aggregateProp
        : getReviewAggregate(reviews),
    [aggregateProp, reviews],
  )

  if (reviews.length < 3) {
    return (
      <section className="mb-10 sm:mb-12" aria-labelledby="reviews-heading">
        <div className="site-container">
          <div className="rounded-2xl border border-dashed border-neutral-light bg-surface px-6 py-10 text-center">
            <p className="text-lg font-bold text-ink">Be the first to review</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-muted">
              Share how Mojesu helped with your rental, purchase or service.
            </p>
            <ArrowPillLink href="#contact" size="md" className="mt-4">
              Leave a review
            </ArrowPillLink>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="flex flex-col pt-4 pb-4 sm:min-h-[100svh] sm:pt-10 sm:pb-12"
      aria-labelledby="reviews-heading"
    >
      <div className="site-container mb-6 flex flex-col items-center text-center sm:mb-8">
        <div className="mb-3 flex w-full max-w-sm items-center gap-3">
          <span
            className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/50"
            aria-hidden="true"
          />
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {intro.eyebrow}
          </p>
          <span
            className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/50"
            aria-hidden="true"
          />
        </div>

        <h2
          id="reviews-heading"
          className="max-w-2xl text-balance text-2xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
        >
          {intro.titleBefore}{' '}
          <span className="text-primary-dark">{intro.titleAccent}</span>
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-neutral-muted">
          {intro.body}
          {aggregate ? (
            <>
              {' '}
              <span className="font-semibold text-ink">
                {aggregate.average.toFixed(1)}★ · {aggregate.count}+ reviews
              </span>
            </>
          ) : null}
        </p>
      </div>

      {/* Mobile: single-line looping marquee */}
      <div className="sm:hidden">
        <MarqueeCards reviews={reviews} />
      </div>

      {/* Desktop: original bento grid */}
      <div className="site-container hidden min-h-0 w-full flex-1 flex-col sm:flex">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {featured && (
            <div className="h-full sm:col-span-2 lg:col-span-1 lg:row-span-2">
              <TestimonialCard review={featured} variant="dark" />
            </div>
          )}
          {others.map((review) => (
            <div key={review.id} className="h-full min-h-0">
              <TestimonialCard review={review} variant="light" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
