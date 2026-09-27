import type { AreaGuide, GuideFaq } from '@/lib/area-guides'
import { breadcrumbList, type Crumb } from '@/components/seo/breadcrumb-json-ld'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

function faqPage(faqs: GuideFaq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

function Script({ graph }: { graph: object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  )
}

export function AreasIndexJsonLd({ faqs }: { faqs: GuideFaq[] }) {
  const origin = siteOrigin()
  const crumbs: Crumb[] = [
    { name: 'Home', path: '/' },
    { name: 'Areas', path: '/areas/' },
  ]
  return (
    <Script
      graph={[
        {
          '@type': 'CollectionPage',
          '@id': `${origin}/areas/#page`,
          name: 'Kampala neighbourhood guides',
          url: `${origin}/areas/`,
          inLanguage: 'en-UG',
          publisher: { '@id': `${origin}/#organization` },
        },
        breadcrumbList(crumbs),
        faqPage(faqs),
      ]}
    />
  )
}

export function AreaGuideJsonLd({
  guide,
  listingSlugs,
}: {
  guide: AreaGuide
  listingSlugs: string[]
}) {
  const origin = siteOrigin()
  const url = `${origin}/areas/${guide.slug}/`
  const inKampala = !['wakiso', 'mukono'].includes(guide.slug)
  return (
    <Script
      graph={[
        {
          '@type': 'CollectionPage',
          '@id': `${url}#page`,
          name: `Homes & land in ${guide.name}`,
          description: guide.summary,
          url,
          inLanguage: 'en-UG',
          publisher: { '@id': `${origin}/#organization` },
          about: {
            '@type': 'Place',
            name: guide.name,
            containedInPlace: inKampala
              ? { '@type': 'City', name: 'Kampala' }
              : { '@type': 'Country', name: 'Uganda' },
          },
          ...(listingSlugs.length
            ? {
                mainEntity: {
                  '@type': 'ItemList',
                  itemListElement: listingSlugs.map((slug, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    url: `${origin}/listings/${slug}/`,
                  })),
                },
              }
            : {}),
        },
        breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Areas', path: '/areas/' },
          { name: guide.name, path: `/areas/${guide.slug}/` },
        ]),
        ...(guide.faqs.length ? [faqPage(guide.faqs)] : []),
      ]}
    />
  )
}
