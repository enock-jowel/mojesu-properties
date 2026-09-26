import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { TierGuideArticle } from '@/components/area-guides'
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld'
import { FaqJsonLd } from '@/components/seo/faq-json-ld'
import { AREA_TIER_LABEL } from '@/lib/areas'
import {
  TIER_GUIDES,
  areasInTier,
  getTierGuideBySlug,
} from '@/lib/area-guides'

export const revalidate = 60

export function generateStaticParams() {
  return TIER_GUIDES.map((g) => ({ tier: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string }>
}): Promise<Metadata> {
  const { tier } = await params
  const guide = getTierGuideBySlug(tier)
  if (!guide) return { title: 'Area tier' }
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/areas/tier/${guide.slug}/` },
  }
}

export default async function AreaTierGuidePage({
  params,
}: {
  params: Promise<{ tier: string }>
}) {
  const { tier } = await params
  const guide = getTierGuideBySlug(tier)
  if (!guide) notFound()

  return (
    <main className="min-h-screen bg-background">
      <FaqJsonLd faqs={guide.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Areas', path: '/areas/' },
          { name: AREA_TIER_LABEL[guide.tier], path: `/areas/tier/${guide.slug}/` },
        ]}
      />
      <SiteHeader />
      <TierGuideArticle guide={guide} areas={areasInTier(guide.tier)} />
      <SiteFooter />
    </main>
  )
}
