'use client'

import { useState } from 'react'
import { Check, Play } from 'lucide-react'
import { AgentsSection } from '@/components/agents-section'
import type { Agent } from '@/lib/agents'
import { ContactSection } from '@/components/contact-section'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import type {
  AboutContent,
  CompanyContent,
  ContactContent,
  SectionIntro,
} from '@/lib/site-content/types'

export function AboutPage({
  agents,
  content,
  company,
  contact,
  agentsIntro,
}: {
  agents: Agent[]
  content: AboutContent
  company: CompanyContent
  contact: ContactContent
  agentsIntro: SectionIntro
}) {
  const ABOUT_HERO = content.hero
  const ABOUT_STORY = content.story
  const ABOUT_VIDEO = content.video
  const ABOUT_APPROACH = content.approach

  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <article>
      {/* 1. Hero */}
      <section className="bg-surface-alt py-12 sm:py-16 lg:py-20">
        <div className="site-container grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-muted">
              {ABOUT_HERO.eyebrow}
            </p>
            <h1 className="max-w-[22rem] text-[2.15rem] font-extrabold leading-[1.15] tracking-tight text-ink sm:max-w-xl sm:text-5xl lg:text-[3.15rem]">
              {ABOUT_HERO.title}
            </h1>
            <div className="h-px w-full bg-black/10" aria-hidden />

            <ul className="flex w-full flex-col gap-6 text-left">
              {ABOUT_HERO.highlights.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-light/60 text-accent-deep">
                    <i
                      className={`${item.iconClass} text-[16px] leading-none`}
                      aria-hidden
                    />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-bold text-ink sm:text-base">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-[14px] leading-relaxed text-neutral-muted sm:text-[15px]">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <ArrowPillLink href={ABOUT_HERO.ctaHref} variant="dark" size="lg">
              {ABOUT_HERO.ctaLabel}
            </ArrowPillLink>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-2 overflow-hidden rounded-[12px] bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_HERO.images.primary}
                alt=""
                className="aspect-[16/9] h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[12px] bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_HERO.images.secondary}
                alt=""
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-[12px] bg-accent-deep px-4 text-center text-white">
              <p className="text-4xl font-extrabold sm:text-5xl">
                {ABOUT_HERO.statCard.value}
              </p>
              <p className="mt-2 text-[13px] text-white/85 sm:text-sm">
                {ABOUT_HERO.statCard.label}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Story — images in one clean row */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="site-container flex w-full flex-col gap-10 lg:gap-14">
          <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
            <span
              className="mb-3 flex h-8 items-end justify-center gap-1 text-neutral-light"
              aria-hidden
            >
              <span className="h-3 w-0.5 rounded-full bg-current" />
              <span className="h-5 w-0.5 rounded-full bg-current" />
              <span className="h-3 w-0.5 rounded-full bg-current" />
            </span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-muted">
              {ABOUT_STORY.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              {ABOUT_STORY.title}
            </h2>
          </div>

          {/* Mobile: images in one clean row, then copy */}
          <div className="flex flex-col gap-8 lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-[16px] bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ABOUT_STORY.images.left}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="overflow-hidden rounded-[16px] bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ABOUT_STORY.images.right}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-6 text-center">
              <p className="text-[15px] leading-relaxed text-neutral-muted">
                {ABOUT_STORY.body}
              </p>
              <div className="w-full">
                <h3 className="text-lg font-extrabold text-ink">
                  {ABOUT_STORY.apartTitle}
                </h3>
                <ul className="mt-4 space-y-3.5 text-left">
                  {ABOUT_STORY.apartItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-deep text-white">
                        <Check className="h-3 w-3 stroke-[3]" aria-hidden />
                      </span>
                      <span className="text-[14.5px] leading-relaxed text-ink">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid w-full grid-cols-2 gap-6 border-t border-black/10 pt-6">
                {ABOUT_STORY.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-extrabold text-ink">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[13px] text-neutral-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: original sandwich layout — unchanged */}
          <div className="hidden grid-cols-[0.85fr_1.3fr_0.85fr] items-center gap-10 lg:grid">
            <div className="overflow-hidden rounded-[20px] bg-surface-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_STORY.images.left}
                alt=""
                className="aspect-[3/4] w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col gap-6">
              <p className="text-[15px] leading-relaxed text-neutral-muted sm:text-base">
                {ABOUT_STORY.body}
              </p>
              <div>
                <h3 className="text-lg font-extrabold text-ink sm:text-xl">
                  {ABOUT_STORY.apartTitle}
                </h3>
                <ul className="mt-4 space-y-3.5">
                  {ABOUT_STORY.apartItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-deep text-white">
                        <Check className="h-3 w-3 stroke-[3]" aria-hidden />
                      </span>
                      <span className="text-[14.5px] leading-relaxed text-ink sm:text-[15px]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-6">
                {ABOUT_STORY.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-extrabold text-ink sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[13px] text-neutral-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[20px] bg-surface-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_STORY.images.right}
                alt=""
                className="aspect-[3/4] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Video banner — play button centered over the title */}
      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="site-container">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[16px] bg-accent-deep sm:aspect-[2.2/1] sm:rounded-[20px]">
            {videoPlaying ? (
              <iframe
                title="Mojesu — property decisions"
                src={`https://www.youtube-nocookie.com/embed/${ABOUT_VIDEO.videoId}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ABOUT_VIDEO.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-accent-deep/55"
                  aria-hidden
                />
                <div className="relative z-[1] flex h-full items-center justify-center px-6 text-center">
                  <h2 className="max-w-[28rem] text-balance text-2xl font-extrabold leading-snug text-white sm:max-w-[36rem] sm:text-3xl lg:text-[2.35rem]">
                    {ABOUT_VIDEO.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(true)}
                    aria-label="Play Mojesu video"
                    className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:h-16 sm:w-16"
                  >
                    <Play className="h-6 w-6 fill-current" aria-hidden />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. Agents — same section as landing */}
      <AgentsSection agents={agents} intro={agentsIntro} />

      {/* 5. Approach — sticky intro, scrolling cards */}
      <section className="relative z-0 bg-surface-alt py-16 sm:py-20 lg:py-24">
        <div className="site-container grid w-full gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <div className="flex flex-col items-center gap-5 text-center lg:sticky lg:top-24 lg:items-start lg:self-start lg:text-left">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-muted">
              {ABOUT_APPROACH.eyebrow}
            </p>
            <h2 className="max-w-[22rem] text-3xl font-extrabold leading-snug tracking-tight text-ink sm:max-w-lg sm:text-4xl">
              {ABOUT_APPROACH.title}
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-neutral-muted">
              {ABOUT_APPROACH.body}
            </p>
            <div className="mt-2 w-full overflow-hidden rounded-[16px] bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_APPROACH.image}
                alt=""
                className="aspect-[16/10] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Mobile only: stacked cards (no sticky overlay that can cover later sections) */}
          <ul className="relative flex flex-col gap-4 lg:hidden">
            {ABOUT_APPROACH.items.map((item) => (
              <li key={item.title}>
                <div className="flex min-h-[140px] gap-4 rounded-[12px] border border-black/[0.06] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-alt text-accent-deep">
                    <i
                      className={`${item.iconClass} text-[16px] leading-none`}
                      aria-hidden
                    />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: original stacked list — unchanged */}
          <ul className="hidden flex-col gap-5 lg:flex">
            {ABOUT_APPROACH.items.map((item) => (
              <li
                key={item.title}
                className="flex min-h-[140px] gap-5 rounded-[12px] border border-black/[0.06] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-alt text-accent-deep">
                  <i
                    className={`${item.iconClass} text-[16px] leading-none`}
                    aria-hidden
                  />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-ink sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-muted sm:text-[15px]">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Contact — reuse landing contact block */}
      <ContactSection company={company} contact={contact} />
    </article>
  )
}
