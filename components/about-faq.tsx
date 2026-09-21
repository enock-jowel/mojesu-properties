import { ArrowPillLink } from '@/components/arrow-pill-button'

type Faq = { question: string; answer: string }

/**
 * Native &lt;details&gt; accordion — works without client JS / hydration.
 */
export function AboutFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <section
      className="relative z-20 bg-background py-16 sm:py-20 lg:pb-28 lg:pt-10"
      aria-labelledby="about-faq-heading"
    >
      <div className="site-container grid w-full gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-muted">
            QUESTIONS
          </p>
          <h2
            id="about-faq-heading"
            className="mt-3 max-w-sm text-3xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl"
          >
            Common questions asked by clients.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-muted">
            Our experienced team is here to provide reliable answers about
            buying &amp; renting homes.
          </p>
          <ArrowPillLink
            href="#contact"
            variant="dark"
            size="lg"
            className="mt-6"
          >
            Talk to us
          </ArrowPillLink>
        </div>

        <div className="relative z-20">
          {faqs.map((faq, i) => (
            <details
              key={faq.question}
              name="about-faq"
              className="group border-b border-black/[0.08] open:pb-0"
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
