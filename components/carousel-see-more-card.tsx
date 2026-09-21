'use client'

import Link from 'next/link'
import { sizedImageUrl } from '@/lib/media'

/**
 * Mobile: sized to the padded track (~2.2 cards + peek). sm+: whole cards.
 */
const CARD_WIDTH =
  'snap-start shrink-0 w-[calc((100%-0.75rem)/2.2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]'

export type SeeMorePreview = {
  url: string
  alt?: string
  title?: string
}

/** Hand-of-cards fan: left, center (top), right — pivot at bottom */
const FAN = [
  {
    base: 'z-[1] -translate-x-[38%] -rotate-[18deg]',
    hover: 'group-hover:-translate-x-[48%] group-hover:-rotate-[24deg]',
  },
  {
    base: 'z-[3] -translate-y-[4%] rotate-0',
    hover: 'group-hover:-translate-y-[10%] group-hover:scale-[1.04]',
  },
  {
    base: 'z-[2] translate-x-[38%] rotate-[18deg]',
    hover: 'group-hover:translate-x-[48%] group-hover:rotate-[24deg]',
  },
] as const

const FALLBACK_TONES = [
  'bg-pill-soft',
  'bg-pill-soft-mid',
  'bg-pill-soft-cool',
] as const

function MiniPropertyCard({
  preview,
  tone,
}: {
  preview: SeeMorePreview | null
  tone: string
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-surface">
      <div className="relative min-h-0 flex-[1.2] overflow-hidden bg-surface-alt">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sizedImageUrl(preview.url, 160)}
            alt=""
            width={160}
            height={120}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`h-full w-full ${tone}`} aria-hidden />
        )}
      </div>
      <div className="shrink-0 space-y-1 px-1.5 py-1.5 sm:px-2 sm:py-2">
        {preview?.title ? (
          <p className="truncate text-[7px] font-bold leading-tight text-ink sm:text-[8px]">
            {preview.title}
          </p>
        ) : (
          <div className="h-1.5 w-[78%] rounded-full bg-neutral-light" aria-hidden />
        )}
        <div className="h-1 w-[52%] rounded-full bg-neutral-light/90" aria-hidden />
      </div>
    </div>
  )
}

/**
 * End-of-carousel card — three mini listing cards held like a hand of playing cards.
 */
export function CarouselSeeMoreCard({
  href,
  label = 'Show more',
  subtitle = 'Browse all matching listings',
  previews = [],
  className = CARD_WIDTH,
}: {
  href: string
  label?: string
  subtitle?: string
  /** Up to 3 covers from the row for the fan */
  previews?: SeeMorePreview[]
  /** Override default listing-carousel card width */
  className?: string
}) {
  // Order for a natural hand: left, center (front), right
  const hand: (SeeMorePreview | null)[] = [
    previews[0] ?? null,
    previews[1] ?? previews[0] ?? null,
    previews[2] ?? previews[1] ?? previews[0] ?? null,
  ]

  return (
    <div className={className}>
      <Link
        href={href}
        className="group flex h-full w-full flex-col text-left"
      >
        <div className="relative flex aspect-[1/0.92] items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-surface-alt via-surface-alt to-pill-soft/50">
          {/* Soft shadow under the hand — like cards resting on a table */}
          <div
            className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-[14%] rounded-[100%] bg-accent-deep/[0.07] blur-md"
            aria-hidden
          />

          <div className="relative mb-[10%] h-[72%] w-[58%]">
            {hand.map((preview, i) => {
              const fan = FAN[i]
              return (
                <div
                  key={i}
                  className={`absolute inset-0 origin-bottom rounded-[11px] border-[1.5px] border-white shadow-[0_10px_28px_rgba(42,46,50,0.22)] transition-transform duration-500 ease-out will-change-transform ${fan.base} ${fan.hover}`}
                >
                  <MiniPropertyCard
                    preview={preview}
                    tone={FALLBACK_TONES[i]}
                  />
                  {/* Card edge highlight */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-[11px] ring-1 ring-inset ring-black/5"
                    aria-hidden
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-3">
          <p className="text-[15.5px] font-bold leading-tight text-ink transition-colors group-hover:text-primary-dark">
            {label}
          </p>
          <p className="mt-0.5 text-sm text-neutral-muted">{subtitle}</p>
        </div>
      </Link>
    </div>
  )
}

export { CARD_WIDTH as CAROUSEL_CARD_WIDTH }
