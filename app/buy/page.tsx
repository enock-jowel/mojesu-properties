import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrowseSkeleton } from '@/components/browse-skeleton'
import { ListingsBrowse } from '@/components/listings-browse'
import { getProperties } from '@/lib/properties'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Homes for Sale in Kampala',
  description:
    'Buy verified houses and apartments in Kampala with clear title status (freehold, mailo, leasehold, and more). Filter by area and budget on Mojesu.',
  alternates: { canonical: '/buy/' },
}

export default async function BuyPage() {
  const properties = await getProperties()

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense fallback={<BrowseSkeleton />}>
        <ListingsBrowse mode="buy" properties={properties} />
      </Suspense>
      <SiteFooter />
    </main>
  )
}
