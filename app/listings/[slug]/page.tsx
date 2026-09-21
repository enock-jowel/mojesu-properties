import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PropertyDetailPage } from '@/components/property-detail-page'
import { ListingJsonLd } from '@/components/seo/listing-json-ld'
import {
  getCachedPropertyBySlug,
  getSimilarCached,
} from '@/lib/listings/cache'
import {
  formatPriceUgx,
  getCoverImage,
  getListingKindLabel,
  getProperties,
  imageUrl,
  priceSuffix,
} from '@/lib/properties'

export const revalidate = 60

export async function generateStaticParams() {
  const all = await getProperties()
  return all.map((p) => ({ slug: p.slug }))
}

function listingTitle(item: {
  title: string
  listingMode: 'rent' | 'sale'
  area: string
  category: string
  bedrooms?: number | null
}): string {
  const mode = item.listingMode === 'rent' ? 'for Rent' : 'for Sale'
  const beds =
    'bedrooms' in item && typeof item.bedrooms === 'number' && item.bedrooms > 0
      ? item.bedrooms
      : null
  if (item.category === 'property' && beds != null) {
    return `${beds}-Bedroom ${item.title} ${mode} in ${item.area}`
  }
  return `${item.title} ${mode} in ${item.area}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getCachedPropertyBySlug(slug)
  if (!item) return { title: 'Listing — Mojesu' }
  const cover = getCoverImage(item.images)
  const coverUrl = cover ? imageUrl(cover) : undefined
  const kind = getListingKindLabel(item)
  const price = `${formatPriceUgx(item.priceUgx)}${priceSuffix(item)}`
  const description =
    item.description?.trim().slice(0, 160) ||
    `${kind} ${item.listingMode === 'rent' ? 'for rent' : 'for sale'} in ${item.area}, Kampala. ${price}. Book a viewing with Mojesu.`

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  const canonical = `${site}/listings/${item.slug}/`

  return {
    title: listingTitle(item),
    description,
    alternates: { canonical },
    openGraph: {
      title: listingTitle(item),
      description,
      url: canonical,
      type: 'website',
      images: coverUrl
        ? [{ url: coverUrl, alt: cover?.alt || item.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: listingTitle(item),
      description,
      images: coverUrl ? [coverUrl] : undefined,
    },
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getCachedPropertyBySlug(slug)
  if (!item) notFound()

  const cover = getCoverImage(item.images)
  const coverUrl = cover ? imageUrl(cover) : null
  if (coverUrl) {
    preload(coverUrl, { as: 'image', fetchPriority: 'high' })
  }

  const similar = await getSimilarCached(item, 5)

  return (
    <main className="min-h-screen bg-background">
      <ListingJsonLd item={item} />
      <SiteHeader />
      <PropertyDetailPage item={item} similar={similar} />
      <SiteFooter />
    </main>
  )
}
