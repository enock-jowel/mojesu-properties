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

  // CMS address also carries opening hours after " · " — keep only the street part.
  const streetAddress = company.address.split('·')[0].trim()
  const phoneDigits = company.phoneTel.replace(/\D/g, '')

  // No `geo` until the exact office pin is confirmed (Google Business Profile).
  const org: Record<string, unknown> = {
    '@type': ['Organization', 'RealEstateAgent', 'LocalBusiness'],
    '@id': `${origin}/#organization`,
    name: 'Mojesu Properties International Ltd',
    alternateName: ['Mojesu Properties', 'Mojesu'],
    url: origin,
    logo: `${origin}/icon.png`,
    image: `${origin}/icon.png`,
    email: company.email,
    telephone: phoneDigits ? `+${phoneDigits}` : company.phoneDisplay,
    address: {
      '@type': 'PostalAddress',
      streetAddress: streetAddress || company.address,
      addressLocality: 'Kampala',
      addressRegion: 'Central Region',
      addressCountry: 'UG',
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

  const website = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: 'Mojesu Properties',
    alternateName: ['Mojesu', 'mojesuproperties.com'],
    inLanguage: 'en-UG',
    publisher: { '@id': `${origin}/#organization` },
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': [org, website],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
