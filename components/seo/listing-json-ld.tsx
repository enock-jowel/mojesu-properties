import {
  formatPriceUgx,
  getCoverImage,
  getListingKindLabel,
  imageUrl,
  type Property,
} from '@/lib/properties'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export function ListingJsonLd({ item }: { item: Property }) {
  const origin = siteOrigin()
  const url = `${origin}/listings/${item.slug}/`
  const cover = getCoverImage(item.images)
  const images = item.images.map((img) => imageUrl(img)).filter(Boolean)
  const kind = getListingKindLabel(item)
  const browse =
    item.category === 'land'
      ? `${origin}/land/`
      : item.listingMode === 'rent'
        ? `${origin}/rent/`
        : `${origin}/buy/`

  const offer = {
    '@type': 'Offer',
    price: item.priceUgx,
    priceCurrency: 'UGX',
    availability: 'https://schema.org/InStock',
    url,
  }

  const listing = {
    '@type': 'RealEstateListing',
    '@id': url,
    name: item.title,
    description: item.description,
    url,
    datePosted: item.listedAt || undefined,
    dateModified: item.updatedAt || item.listedAt || undefined,
    image: images.length ? images : cover ? [imageUrl(cover)] : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: item.area,
      addressRegion: 'Kampala',
      addressCountry: 'UG',
    },
    offers: offer,
    numberOfRooms:
      item.category === 'property' &&
      'bedrooms' in item &&
      item.bedrooms != null
        ? item.bedrooms
        : undefined,
    numberOfBathroomsTotal:
      item.category === 'property' &&
      'bathrooms' in item &&
      item.bathrooms != null
        ? item.bathrooms
        : undefined,
    floorSize:
      'sizeSqm' in item && item.sizeSqm != null
        ? {
            '@type': 'QuantitativeValue',
            value: item.sizeSqm,
            unitCode: 'MTK',
          }
        : undefined,
    additionalType: kind,
  }

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name:
          item.category === 'land'
            ? 'Land'
            : item.listingMode === 'rent'
              ? 'Rent'
              : 'Buy',
        item: browse,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: item.area,
        item: `${browse}?location=${encodeURIComponent(item.area)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: item.title,
        item: url,
      },
    ],
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': [listing, breadcrumb],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

/** Kept for callers that only need a price line in UI copy. */
export function listingPriceLabel(item: Property): string {
  return formatPriceUgx(item.priceUgx)
}
