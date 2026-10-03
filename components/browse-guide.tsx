import Link from 'next/link'
import { GuideFaqSection } from '@/components/area-guides'
import { breadcrumbList } from '@/components/seo/breadcrumb-json-ld'
import type { GuideFaq } from '@/lib/area-guides'
import { areaGuideHref } from '@/lib/area-links'
import {
  TITLE_STATUS_LABEL,
  filterProperties,
  formatPriceUgx,
  type Property,
} from '@/lib/properties'

type HubMode = 'rent' | 'buy' | 'land'

const HUB: Record<
  HubMode,
  { path: string; crumb: string; heading: string; noun: string; summary: string }
> = {
  rent: {
    path: '/rent/',
    crumb: 'Rent',
    heading: 'Houses for rent in Kampala',
    noun: 'properties to rent',
    summary:
      'Every rental on Mojesu shows the monthly rent in UGX, the neighbourhood, bedrooms and bathrooms up front — plus deposit and lease terms where the landlord has shared them. Filter by area, budget and house type above, then book a viewing online.',
  },
  buy: {
    path: '/buy/',
    crumb: 'Buy',
    heading: 'Houses for sale in Kampala',
    noun: 'properties for sale',
    summary:
      'Each home for sale on Mojesu shows its asking price in UGX, the neighbourhood and size up front. Filter by area and budget above, then book a viewing online.',
  },
  land: {
    path: '/land/',
    crumb: 'Land',
    heading: 'Land for sale in Kampala',
    noun: 'plots for sale',
    summary:
      'Plots on Mojesu list the asking price in UGX and plot dimensions up front, across Kampala and nearby Wakiso and Mukono. Filter by area, land type and budget above, then arrange a site visit.',
  },
}

function hubItems(properties: Property[], mode: HubMode): Property[] {
  if (mode === 'land') return filterProperties(properties, { category: 'land' })
  return filterProperties(properties, {
    category: 'property',
    listingMode: mode === 'rent' ? 'rent' : 'sale',
  })
}

function range(items: Property[]): string | null {
  const prices = items.map((p) => p.priceUgx).filter((n) => n > 0)
  if (!prices.length) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPriceUgx(min) : `${formatPriceUgx(min)} to ${formatPriceUgx(max)}`
}

function countBy<T extends string>(values: (T | undefined)[]): [T, number][] {
  const counts = new Map<T, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function listPhrase(parts: string[]): string {
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/** Answers come only from live listings and what the site itself offers. */
function hubFaqs(mode: HubMode, items: Property[], areas: [string, number][]): GuideFaq[] {
  const faqs: GuideFaq[] = []
  const areaList = listPhrase(areas.map(([a, n]) => `${a} (${n})`))
  const residential = items.filter((p) => p.category === 'property' && p.useClass === 'residential')
  const titles = countBy(items.map((p) => p.titleStatus)).map(
    ([t, n]) => `${TITLE_STATUS_LABEL[t]} (${n})`,
  )

  if (mode === 'rent') {
    if (areas.length) {
      faqs.push({
        question: 'Which Kampala areas have houses for rent on Mojesu?',
        answer: `Right now we have rentals in ${areaList}. Our neighbourhood guides cover what each area is like and who it suits.`,
      })
    }
    const rents = range(residential)
    if (rents) {
      faqs.push({
        question: 'How much is rent for a house in Kampala on Mojesu?',
        answer: `Our current residential rentals range from ${rents} per month. Rent depends on area, size and finish — every listing shows its monthly price, and deposit and lease terms where the landlord has provided them.`,
      })
    }
  } else if (mode === 'buy') {
    if (areas.length) {
      faqs.push({
        question: 'Where in Kampala can I buy a house through Mojesu?',
        answer: `We currently have properties for sale in ${areaList}. Our neighbourhood guides show everything we list in each area.`,
      })
    }
    const prices = range(residential)
    if (prices) {
      faqs.push({
        question: 'How much do houses for sale cost on Mojesu?',
        answer: `Our current homes for sale are priced from ${prices}. Each listing shows the asking price and whether it is negotiable.`,
      })
    }
  } else {
    if (areas.length) {
      faqs.push({
        question: 'Where can I buy land around Kampala on Mojesu?',
        answer: `We currently list plots in ${areaList}. Our neighbourhood guides show everything we list in each area.`,
      })
    }
    const sizes = countBy(
      items.map((p) => (p.category === 'land' ? p.plotDimensions?.trim() || undefined : undefined)),
    )
      .slice(0, 5)
      .map(([s]) => s)
    const prices = range(items)
    if (prices) {
      faqs.push({
        question: 'How much does a plot of land cost on Mojesu?',
        answer: `Our current plots are priced from ${prices}${sizes.length ? `, in sizes including ${listPhrase(sizes)}` : ''}. Each listing states its plot dimensions and asking price.`,
      })
    }
  }

  if (mode !== 'rent' && titles.length) {
    faqs.push({
      question:
        mode === 'land'
          ? 'What land titles do your plots have?'
          : 'What title types do your homes for sale have?',
      answer: `Every sale listing states its title type. Our current ${mode === 'land' ? 'plots' : 'listings'} include ${listPhrase(titles)}. Our land surveying and title verification service can check documents and boundaries before you commit.`,
    })
  }

  faqs.push(
    mode === 'rent'
      ? {
          question: 'Can a Mojesu agent find a rental for me?',
          answer:
            'Yes. With agent-assisted search, a dedicated Mojesu agent shortlists homes that match your budget and neighbourhoods, then coordinates viewings until you decide.',
        }
      : {
          question: 'How do I arrange a viewing?',
          answer:
            'Open any listing and use Book a viewing to choose a preferred date and time and leave your phone number. Mojesu then contacts you to confirm.',
        },
  )

  return faqs
}

function HubJsonLd({
  mode,
  items,
  faqs,
}: {
  mode: HubMode
  items: Property[]
  faqs: GuideFaq[]
}) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  const hub = HUB[mode]
  const url = `${origin}${hub.path}`
  const graph: object[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      name: hub.heading,
      url,
      inLanguage: 'en-UG',
      isPartOf: { '@id': `${origin}/#website` },
      publisher: { '@id': `${origin}/#organization` },
      ...(items.length
        ? {
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: items.length,
              itemListElement: items.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${origin}/listings/${p.slug}/`,
              })),
            },
          }
        : {}),
    },
    breadcrumbList([
      { name: 'Home', path: '/' },
      { name: hub.crumb, path: hub.path },
    ]),
  ]
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  )
}

/** Server-rendered intro, area links and FAQ under the rent / buy / land browse grid. */
export function BrowseGuide({ mode, properties }: { mode: HubMode; properties: Property[] }) {
  const hub = HUB[mode]
  const items = hubItems(properties, mode)
  const areas = countBy(items.map((p) => p.area))
  const faqs = hubFaqs(mode, items, areas)
  const prices = range(
    mode === 'land'
      ? items
      : items.filter((p) => p.category === 'property' && p.useClass === 'residential'),
  )
  const facts = items.length
    ? `Mojesu currently lists ${items.length} ${hub.noun} across ${areas.length} area${areas.length === 1 ? '' : 's'}${prices ? `, ${mode === 'land' ? 'priced' : 'with homes'} from ${prices}${mode === 'rent' ? ' per month' : ''}` : ''}.`
    : null
  const browseHref = (area: string) =>
    areaGuideHref(area) ?? `${hub.path}?location=${encodeURIComponent(area)}`

  return (
    <>
      <HubJsonLd mode={mode} items={items} faqs={faqs} />
      <section className="site-container pt-2" aria-labelledby="hub-answer-heading">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="rounded-2xl border border-primary/15 bg-pill-soft px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
              In short
            </p>
            <h2
              id="hub-answer-heading"
              className="mt-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
            >
              {hub.heading}
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink sm:text-base">
              {hub.summary}
            </p>
            {facts ? (
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-muted">{facts}</p>
            ) : null}
          </div>

          {areas.length ? (
            <nav aria-label={`${hub.heading} by area`} className="flex flex-col gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-muted/80">
                Browse by area
              </p>
              <ul className="flex flex-wrap gap-2">
                {areas.map(([area, count]) => (
                  <li key={area}>
                    <Link
                      href={browseHref(area)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-inset ring-neutral-light transition-colors hover:bg-pill-soft hover:ring-primary/30"
                    >
                      {area}
                      <span className="text-neutral-muted">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/areas/"
                className="text-[14px] font-semibold text-primary-dark underline-offset-2 hover:underline"
              >
                Compare all Kampala neighbourhoods
              </Link>
            </nav>
          ) : null}
        </div>
      </section>

      {faqs.length ? (
        <div className="mt-4 sm:mt-8">
          <GuideFaqSection
            faqs={faqs}
            title={`${hub.heading}: common questions.`}
            body="Straight answers based on the listings we have live right now."
          />
        </div>
      ) : null}
    </>
  )
}
