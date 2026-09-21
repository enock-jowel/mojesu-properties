import { ArrowPillLink } from '@/components/arrow-pill-button'
import { getHomeContent } from '@/lib/site-content/queries'

export async function CtaStrip() {
  const { cta } = await getHomeContent()

  return (
    <section id="cta" className="site-container pt-4 pb-4 sm:pt-0 sm:pb-24">
      <div className="flex flex-col items-start justify-between gap-8 rounded-[1.75rem] bg-accent-deep px-8 py-14 text-white sm:flex-row sm:items-center sm:px-14">
        <div>
          <h2 className="max-w-[480px] text-3xl font-extrabold leading-tight text-balance sm:text-4xl">
            {cta.title}
          </h2>
          <p className="mt-2.5 max-w-[420px] text-base text-white/90 text-pretty">
            {cta.body}
          </p>
        </div>
        <ArrowPillLink href={cta.buttonHref} variant="onPrimary" size="lg">
          {cta.buttonLabel}
        </ArrowPillLink>
      </div>
    </section>
  )
}
