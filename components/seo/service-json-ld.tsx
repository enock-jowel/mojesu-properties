import type { ServiceDetail } from '@/lib/services'
import { breadcrumbList } from '@/components/seo/breadcrumb-json-ld'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export function ServiceJsonLd({
  service,
  description,
}: {
  service: ServiceDetail
  description: string
}) {
  const origin = siteOrigin()
  const url = `${origin}/services/${service.slug}/`
  const image = service.image.startsWith('/') ? `${origin}${service.image}` : service.image

  const node = {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.name,
    description,
    url,
    image,
    provider: { '@id': `${origin}/#organization` },
    areaServed: [
      { '@type': 'City', name: 'Kampala' },
      { '@type': 'AdministrativeArea', name: 'Wakiso' },
      { '@type': 'AdministrativeArea', name: 'Mukono' },
    ],
    hasOfferCatalog: service.offerings.items.length
      ? {
          '@type': 'OfferCatalog',
          name: service.offerings.title,
          itemListElement: service.offerings.items.map((item) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: item.title, description: item.description },
          })),
        }
      : undefined,
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      node,
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services/' },
        { name: service.name, path: `/services/${service.slug}/` },
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
