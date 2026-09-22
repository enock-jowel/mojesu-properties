import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { TierGuideArticle } from '@/components/area-guides'
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
  if (!guide) return { title: 'Area tier — Mojesu' }
  return {
    title: `${guide.title} — Mojesu`,
    description: guide.summary,
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
      <SiteHeader />
      <TierGuideArticle guide={guide} areas={areasInTier(guide.tier)} />
      <SiteFooter />
    </main>
  )
}
