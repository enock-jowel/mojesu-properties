import type { CompanyContent } from '@/lib/site-content/types'
import type { Review, ReviewAggregate } from '@/lib/reviews'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export function OrganizationJsonLd({
  company,
  reviews,
  aggregate,
}: {
  company: CompanyContent
  reviews?: Review[]
  aggregate?: ReviewAggregate | null
}) {
  const origin = siteOrigin()
  const sameAs = company.socials.map((s) => s.href).filter(Boolean)

  const org: Record<string, unknown> = {
    '@type': ['Organization', 'RealEstateAgent', 'LocalBusiness'],
    '@id': `${origin}/#organization`,
    name: 'Mojesu Properties International Ltd',
    url: origin,
    logo: `${origin}/icon.png`,
    email: company.email,
    telephone: company.phoneDisplay,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressLocality: 'Kampala',
      addressRegion: 'Central Region',
      addressCountry: 'UG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 0.3476,
      longitude: 32.5825,
    },
    areaServed: [
      { '@type': 'City', name: 'Kampala' },
      { '@type': 'AdministrativeArea', name: 'Wakiso' },
      { '@type': 'AdministrativeArea', name: 'Mukono' },
    ],
    sameAs: sameAs.length ? sameAs : undefined,
  }

  if (aggregate && aggregate.count > 0) {
    org.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregate.average,
      reviewCount: aggregate.count,
      bestRating: 5,
      worstRating: 1,
    }
  } else if (reviews && reviews.length > 0) {
    const withRating = reviews.filter((r) => typeof r.rating === 'number')
    if (withRating.length > 0) {
      const sum = withRating.reduce((s, r) => s + (r.rating || 0), 0)
      org.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number((sum / withRating.length).toFixed(1)),
        reviewCount: withRating.length,
        bestRating: 5,
        worstRating: 1,
      }
    }
  }

  const payload = {
    '@context': 'https://schema.org',
    ...org,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
