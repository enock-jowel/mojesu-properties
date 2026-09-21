'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ServiceDetail, ServiceOfferingItem } from '@/lib/services'
import { ServiceEnquiryCard } from '@/components/service-enquiry-form'

function OtherServices({
  others,
}: {
  currentSlug: string
  others: ServiceDetail[]
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-muted/80">
        Others services
      </p>
      <ul className="flex flex-col gap-2.5">
        {others.map((item) => (
          <li key={item.id}>
            <Link
              href={`/services/${item.slug}/`}
              className="relative flex items-center justify-between gap-3 overflow-hidden rounded-[10px] bg-surface-alt px-5 py-4 transition-colors hover:bg-neutral-light/40"
            >
              <span className="relative z-[1] text-[15px] font-semibold text-ink">
                {item.name}
              </span>
              <ChevronRight
                className="relative z-[1] h-5 w-5 shrink-0 text-ink/70"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-muted/70">
      {children}
    </p>
  )
}

function OfferingCardBody({ item }: { item: ServiceOfferingItem }) {
  return (
    <>
      <i
        className={`${item.iconClass} text-[22px] text-accent-deep`}
        aria-hidden
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-[16px] font-bold text-ink">{item.title}</h3>
        <p className="text-[14px] leading-relaxed text-neutral-muted">
          {item.description}
        </p>
      </div>
    </>
  )
}

export function ServiceDetailPage({
  service,
  others,
}: {
  service: ServiceDetail
  others: ServiceDetail[]
}) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [service.slug])

  return (
    <article className="w-full max-w-full pb-28 lg:pb-0">
      {/* Hero — full-bleed image + overlay copy */}
      <header className="relative flex min-h-[320px] w-full max-w-full items-end overflow-hidden sm:min-h-[380px] lg:min-h-[420px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt=""
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
              <Link
                href="/services/"
                className="transition-colors hover:text-white"
              >
                All services
              </Link>
              <span aria-hidden="true">&gt;</span>
              <span>service</span>
            </nav>

            <div className="h-px w-full max-w-[800px] bg-white/20" aria-hidden />

            <div className="flex w-full min-w-0 max-w-[800px] flex-col gap-3.5">
              <h1 className="w-full max-w-full text-balance break-words text-[1.85rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                {service.name}
              </h1>
              <p className="max-w-full text-pretty text-[15px] leading-relaxed text-white/90 sm:text-base">
                {service.heroDescription}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body — left content + sticky sidebar */}
      <section className="py-14 sm:py-20 lg:pb-[120px] lg:pt-[100px]">
        <div className="site-container flex w-full flex-col items-start gap-12 lg:flex-row lg:gap-20">
          {/* Main column */}
          <div className="flex min-w-0 flex-1 flex-col gap-[60px]">
            {/* Answer-first summary for AI Overviews / skimmers */}
            <section
              aria-labelledby="service-answer-heading"
              className="rounded-2xl border border-primary/15 bg-pill-soft px-5 py-5 sm:px-6 sm:py-6"
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                In short
              </p>
              <h2
                id="service-answer-heading"
                className="mt-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
              >
                {service.name} with Mojesu in Kampala
              </h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink sm:text-base">
                {service.heroDescription}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-muted">
                {service.whatWeDo.body}
              </p>
            </section>

            {/* What we do */}
            <section
              aria-labelledby="what-we-do-heading"
              className="flex flex-col gap-5"
            >
              <SectionEyebrow>What we do</SectionEyebrow>
              <h2
                id="what-we-do-heading"
                className="max-w-[40rem] text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
              >
                {service.whatWeDo.title}
              </h2>
              <p className="max-w-[40rem] text-[15px] leading-relaxed text-neutral-muted sm:text-base">
                {service.whatWeDo.body}
              </p>
              <div className="relative mt-2 aspect-[1.89/1] w-full overflow-hidden rounded-lg bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.whatWeDo.image}
                  alt={service.whatWeDo.imageAlt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </section>

            {/* Services offered */}
            <section
              aria-labelledby="offerings-heading"
              className="relative flex flex-col gap-5 border-t border-black/10 pt-8"
            >
              <SectionEyebrow>Services Offered</SectionEyebrow>
              <h2
                id="offerings-heading"
                className="max-w-[40rem] text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
              >
                {service.offerings.title}
              </h2>
              <p className="max-w-[40rem] text-[15px] leading-relaxed text-neutral-muted sm:text-base">
                {service.offerings.body}
              </p>

              {/* Mobile only: sticky stack (next card overlays the current) */}
              <ul className="relative mt-2 flex flex-col sm:hidden">
                {service.offerings.items.map((item, index) => (
                  <li
                    key={item.title}
                    className="sticky top-[4.75rem] mb-4 last:mb-0"
                    style={{ zIndex: index + 1 }}
                  >
                    <div className="flex min-h-[190px] flex-col items-center justify-center gap-3.5 rounded-[12px] border border-black/[0.08] bg-surface px-5 py-9 text-center shadow-[0_-12px_32px_rgba(42,46,50,0.1)]">
                      <OfferingCardBody item={item} />
                    </div>
                  </li>
                ))}
              </ul>

              {/* sm+ / desktop: original grid — unchanged */}
              <ul className="mt-2 hidden grid-cols-1 gap-5 sm:grid sm:grid-cols-2">
                {service.offerings.items.map((item) => (
                  <li
                    key={item.title}
                    className="flex flex-col items-center gap-3.5 rounded-[9px] border border-black/[0.08] px-5 py-8 text-center sm:px-6"
                  >
                    <OfferingCardBody item={item} />
                  </li>
                ))}
              </ul>
            </section>

            {/* How we work */}
            <section
              aria-labelledby="process-heading"
              className="relative flex flex-col gap-5 border-t border-black/10 pt-8"
            >
              <SectionEyebrow>How we work</SectionEyebrow>
              <h2
                id="process-heading"
                className="max-w-[40rem] text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
              >
                {service.process.title}
              </h2>
              <p className="max-w-[40rem] text-[15px] leading-relaxed text-neutral-muted sm:text-base">
                {service.process.body}
              </p>

              <div className="relative mt-1 aspect-[1.89/1] w-full overflow-hidden rounded-lg bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.process.image}
                  alt={service.process.imageAlt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <ol className="mt-2 flex flex-col gap-6">
                {service.process.steps.map((step) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-[18px] w-[18px] shrink-0 rounded-full bg-accent-deep"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] font-bold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-[14px] leading-relaxed text-neutral-muted">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Other services — mobile (below content) */}
            {others.length > 0 ? (
              <div className="lg:hidden">
                <OtherServices currentSlug={service.slug} others={others} />
              </div>
            ) : null}
          </div>

          {/* Sticky sidebar — desktop only */}
          <aside className="hidden w-full shrink-0 flex-col gap-10 self-start lg:sticky lg:top-24 lg:flex lg:w-[min(100%,380px)] lg:max-w-[38%]">
            <ServiceEnquiryCard service={service} variant="sidebar" />
            {others.length > 0 ? (
              <OtherServices currentSlug={service.slug} others={others} />
            ) : null}
          </aside>
        </div>
      </section>

      <ServiceEnquiryCard service={service} variant="mobile" />
    </article>
  )
}
