import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AreasIndex } from '@/components/area-guides'
import { FaqJsonLd } from '@/components/seo/faq-json-ld'
import { AREAS_INDEX_FAQS } from '@/lib/area-guides'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Kampala area guides',
  description:
    'Neighbourhood guides for prime, mid-market, and emerging Kampala corridors — with links to live Rent, Buy, and Land listings.',
  alternates: { canonical: '/areas/' },
}

export default function AreasPage() {
  return (
    <>
      <FaqJsonLd faqs={AREAS_INDEX_FAQS} />
      <SiteHeader />
      <AreasIndex />
      <SiteFooter />
    </>
  )
}
