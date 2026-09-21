'use client'

import type { Agent } from '@/lib/agents'
import type { SectionIntro } from '@/lib/site-content/types'
import { sizedImageUrl } from '@/lib/media'

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article className="group flex w-full flex-col">
      <a
        href={agent.profileHref ?? '#contact'}
        aria-label={`Contact ${agent.name}, ${agent.role}`}
        className="relative block aspect-[1/0.95] overflow-hidden rounded-[10px] bg-surface-alt"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sizedImageUrl(agent.photoUrl, 400)}
          alt={agent.name}
          width={400}
          height={380}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </a>

      <div className="mt-3.5 flex flex-1 flex-col">
        <h3 className="text-[15px] font-bold text-ink sm:text-base">
          {agent.name}
        </h3>
        <p className="mt-0.5 text-[13px] text-neutral-muted">{agent.role}</p>

        <div className="mt-3 flex items-center gap-2.5">
          {agent.instagramUrl ? (
            <a
              href={agent.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${agent.name} on Instagram`}
              className="text-ink/45 transition-colors hover:text-ink"
            >
              <i
                className="fi fi-brands-instagram text-[15px] leading-none"
                aria-hidden
              />
            </a>
          ) : null}
          {agent.linkedinUrl ? (
            <a
              href={agent.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${agent.name} on LinkedIn`}
              className="text-ink/45 transition-colors hover:text-ink"
            >
              <i
                className="fi fi-brands-linkedin text-[15px] leading-none"
                aria-hidden
              />
            </a>
          ) : null}
          <a
            href={agent.profileHref ?? '#contact'}
            aria-label={`View ${agent.name}`}
            className="text-ink/45 transition-colors hover:text-ink"
          >
            <i
              className="fi fi-rr-arrow-up-right-from-square text-[14px] leading-none"
              aria-hidden
            />
          </a>
        </div>
      </div>
    </article>
  )
}

export function AgentsSection({
  agents,
  intro,
}: {
  agents: Agent[]
  intro: SectionIntro
}) {
  return (
    <section
      id="agents"
      className="flex flex-col pt-4 pb-4 sm:min-h-[100svh] sm:pt-10 sm:pb-12"
      aria-labelledby="agents-heading"
    >
      <div className="site-container mb-3 flex flex-col items-center text-center sm:mb-8">
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
          id="agents-heading"
          className="max-w-2xl text-balance text-2xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
        >
          {intro.titleBefore}{' '}
          <span className="text-primary-dark">{intro.titleAccent}</span>
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-neutral-muted">
          {intro.body}
        </p>
        <p className="mt-2 max-w-xl text-pretty text-[13px] leading-relaxed text-neutral-muted/90">
          Our agents work Kampala corridors daily — local pricing, title tenure
          (freehold, mailo, leasehold, and more), and viewing logistics from
          first enquiry through handover.
        </p>
      </div>

      <div className="w-full sm:flex sm:min-h-0 sm:flex-1 sm:flex-col sm:justify-center">
        <div className="carousel-track-shell">
          <div
            className="carousel-track gap-4 pb-2 sm:gap-5"
            role="list"
          >
            {agents.map((agent) => (
              <div
                key={agent.id}
                role="listitem"
                className="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[260px]"
              >
                <AgentCard agent={agent} />
              </div>
            ))}
            {/* Trailing spacer so last card clears the edge (desktop) */}
            <div className="hidden w-2 shrink-0 sm:block sm:w-4" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  )
}
