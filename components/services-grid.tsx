import type { ServiceDetail } from '@/lib/services'
import type { SectionIntro } from '@/lib/site-content/types'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import { sizedImageUrl } from '@/lib/media'

function ServiceCard({ service }: { service: ServiceDetail }) {
  return (
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
        <h3 className="line-clamp-1 text-[15.5px] font-bold leading-snug text-white">
          {service.name}
        </h3>
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
  )
}

/** Pair services into columns of 2 for the mobile 2-row carousel. */
function serviceColumns(services: ServiceDetail[]) {
  const columns: ServiceDetail[][] = []
  for (let i = 0; i < services.length; i += 2) {
    columns.push(services.slice(i, i + 2))
  }
  return columns
}

/**
 * Landing services — mobile: 2-row horizontal carousel with shared gutters;
 * sm+: static grid.
 */
export function ServicesGrid({
  services,
  intro,
}: {
  services: ServiceDetail[]
  intro: SectionIntro
}) {
  const columns = serviceColumns(services)

  return (
    <section
      id="services"
      className="mb-4 flex flex-col sm:mb-12"
      aria-labelledby="services-heading"
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
          id="services-heading"
          className="max-w-2xl text-balance text-2xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
        >
          {intro.titleBefore}{' '}
          <span className="text-primary-dark">{intro.titleAccent}</span>
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-neutral-muted">
          {intro.body}
        </p>
      </div>

      {/* Mobile: 2-row horizontal carousel (same gutter / fade as listing rows) */}
      <div className="carousel-track-shell sm:hidden">
        <div className="carousel-track gap-3 pb-2">
          {columns.map((column) => (
            <div
              key={column.map((s) => s.id).join('-')}
              className="flex w-[calc(100%-1.75rem)] shrink-0 snap-start flex-col gap-3"
            >
              {column.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: original grid */}
      <div className="site-container hidden sm:block">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {services.map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
