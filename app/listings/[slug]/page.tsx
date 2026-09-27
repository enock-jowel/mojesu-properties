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
import { getCoverImage, getProperties, imageUrl } from '@/lib/properties'
import { listingSeoDescription, listingSeoTitle } from '@/lib/seo/listing-meta'

export const revalidate = 60

export async function generateStaticParams() {
  const all = await getProperties()
  return all.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getCachedPropertyBySlug(slug)
  if (!item) return { title: 'Listing' }
  const cover = getCoverImage(item.images)
  const coverUrl = cover ? imageUrl(cover) : undefined
  const title = listingSeoTitle(item)
  const description = listingSeoDescription(item)

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  const canonical = `${site}/listings/${item.slug}/`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: coverUrl
        ? [{ url: coverUrl, alt: cover?.alt || item.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
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
