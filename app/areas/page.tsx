import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AreasIndex } from '@/components/area-guides'
import { AreasIndexJsonLd } from '@/components/seo/area-json-ld'
import { AREAS_INDEX_FAQS } from '@/lib/area-guides'
import { getProperties } from '@/lib/properties'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Kampala Neighbourhood Guides: Where to Live',
  description:
    'Compare Kampala neighbourhoods — prime hills, mid-market suburbs and emerging corridors — with live homes and plots for rent and sale in each area.',
  alternates: { canonical: '/areas/' },
}

export default async function AreasPage() {
  const properties = await getProperties()
  return (
    <main className="min-h-screen bg-background">
      <AreasIndexJsonLd faqs={AREAS_INDEX_FAQS} />
      <SiteHeader />
      <AreasIndex properties={properties} />
      <SiteFooter />
    </main>
  )
}
