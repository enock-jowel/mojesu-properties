import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AreaGuideArticle } from '@/components/area-guides'
import {
  AREA_GUIDES,
  getAreaGuideBySlug,
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
  if (!guide) return { title: 'Area guide — Mojesu' }
  return {
    title: `${guide.name} area guide — Mojesu`,
    description: guide.summary,
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

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <AreaGuideArticle guide={guide} />
      <SiteFooter />
    </main>
  )
}
