import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrowseSkeleton } from '@/components/browse-skeleton'
import { ListingsBrowse } from '@/components/listings-browse'
import { getProperties } from '@/lib/properties'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Homes for Rent in Kampala',
  description:
    'Browse verified Kampala rentals by area, price, and house type. Filter mid-market and prime neighbourhoods, then book a Mojesu viewing online.',
  alternates: { canonical: '/rent/' },
}

export default async function RentPage() {
  const properties = await getProperties()

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense fallback={<BrowseSkeleton />}>
        <ListingsBrowse mode="rent" properties={properties} />
      </Suspense>
      <SiteFooter />
    </main>
  )
}
