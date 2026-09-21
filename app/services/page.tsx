import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getAllServices } from '@/lib/services'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import { getHomeContent } from '@/lib/site-content/queries'
import { sizedImageUrl } from '@/lib/media'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Services — Mojesu',
  description:
    'Property management, valuation, surveying, agent-assisted search, development consulting, and facilities management across Kampala.',
}

export default async function ServicesIndexPage() {
  const [services, home] = await Promise.all([
    getAllServices(),
    getHomeContent(),
  ])
  const shell = home.indexPages.services

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <header className="bg-surface-alt px-4 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-4 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {shell.eyebrow}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {shell.title}
          </h1>
          <p className="max-w-[640px] text-pretty text-[15px] leading-relaxed text-neutral-muted sm:text-base">
            {shell.body}
          </p>
        </div>
      </header>

      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-[30px] lg:pb-24">
        <ul className="mx-auto grid w-full max-w-[1300px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {services.map((service) => (
            <li key={service.id}>
              <article className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sizedImageUrl(service.image, 720)}
                  alt={service.imageAlt}
                  width={720}
                  height={450}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-accent-deep/90 via-accent-deep/40 to-accent-deep/5"
                  aria-hidden
                />
                <span className="absolute left-3 top-3 z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-accent-deep shadow-md sm:h-10 sm:w-10">
                  <i
                    className={`${service.iconClass} text-[15px] leading-none`}
                    aria-hidden
                  />
                </span>
                <div className="absolute inset-x-0 bottom-0 z-[1] p-3.5 sm:p-4">
                  <h2 className="line-clamp-1 text-[15.5px] font-bold leading-snug text-white">
                    {service.name}
                  </h2>
                  <div className="mt-1.5 flex items-end gap-2.5">
                    <p className="min-w-0 flex-1 line-clamp-2 text-sm leading-snug text-white/85">
                      {service.description}
                    </p>
                    <ArrowPillLink
                      href={`/services/${service.slug}/`}
                      variant="glass"
                      size="sm"
                    >
                      Learn more
                    </ArrowPillLink>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  )
}
