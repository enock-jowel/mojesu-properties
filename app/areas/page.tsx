import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AreasIndex } from '@/components/area-guides'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Kampala area guides — Mojesu',
  description:
    'Neighbourhood guides for prime, mid-market, and emerging Kampala corridors — with links to live Rent, Buy, and Land listings.',
}

export default function AreasPage() {
  return (
    <>
      <SiteHeader />
      <AreasIndex />
      <SiteFooter />
    </>
  )
}
