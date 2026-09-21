import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrowseSkeleton } from '@/components/browse-skeleton'
import { ListingsBrowse } from '@/components/listings-browse'
import { getProperties } from '@/lib/properties'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Land for Sale in Kampala & Surrounds',
  description:
    'Browse residential and commercial plots with title status clearly labelled. Search Kampala, Wakiso, Mukono, and emerging corridors on Mojesu.',
  alternates: { canonical: '/land/' },
}

export default async function LandPage() {
  const properties = await getProperties()

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense fallback={<BrowseSkeleton />}>
        <ListingsBrowse mode="land" properties={properties} />
      </Suspense>
      <SiteFooter />
    </main>
  )
}
