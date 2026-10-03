import { breadcrumbList } from '@/components/seo/breadcrumb-json-ld'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

/** CollectionPage + ItemList + BreadcrumbList for index pages (services, insights). */
export function CollectionJsonLd({
  name,
  path,
  crumb,
  itemPaths,
}: {
  name: string
  path: string
  crumb: string
  itemPaths: string[]
}) {
  const origin = siteOrigin()
  const url = `${origin}${path}`
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name,
        url,
        inLanguage: 'en-UG',
        isPartOf: { '@id': `${origin}/#website` },
        publisher: { '@id': `${origin}/#organization` },
        ...(itemPaths.length
          ? {
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: itemPaths.length,
                itemListElement: itemPaths.map((p, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `${origin}${p}`,
                })),
              },
            }
          : {}),
      },
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: crumb, path },
      ]),
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
