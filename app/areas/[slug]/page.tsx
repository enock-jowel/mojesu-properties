import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AreaGuideArticle } from '@/components/area-guides'
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld'
import { FaqJsonLd } from '@/components/seo/faq-json-ld'
import { AREA_TIER_LABEL } from '@/lib/areas'
import {
  AREA_GUIDES,
  getAreaGuideBySlug,
  getTierGuide,
} from '@/lib/area-guides'

export const revalidate = 60

export function generateStaticParams() {
  return AREA_GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getAreaGuideBySlug(slug)
  if (!guide) return { title: 'Area guide' }
  return {
    title: `${guide.name} area guide — homes to rent & buy`,
    description: guide.summary,
    alternates: { canonical: `/areas/${guide.slug}/` },
  }
}

export default async function AreaGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getAreaGuideBySlug(slug)
  if (!guide) notFound()
  const tier = getTierGuide(guide.tier)

  return (
    <main className="min-h-screen bg-background">
      <FaqJsonLd faqs={guide.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Areas', path: '/areas/' },
          ...(tier
            ? [{ name: AREA_TIER_LABEL[guide.tier], path: `/areas/tier/${tier.slug}/` }]
            : []),
          { name: guide.name, path: `/areas/${guide.slug}/` },
        ]}
      />
      <SiteHeader />
      <AreaGuideArticle guide={guide} />
      <SiteFooter />
    </main>
  )
}
