import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AreaGuideView, areaStats } from '@/components/area-guides'
import { AreaGuideJsonLd } from '@/components/seo/area-json-ld'
import { AREA_GUIDES, getAreaGuideBySlug } from '@/lib/area-guides'
import { getProperties } from '@/lib/properties'
import { toPropertyCardData } from '@/lib/property-card-data'
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og'
import { getTaxonomyContent } from '@/lib/site-content/queries'

export const revalidate = 60

export function generateStaticParams() {
  return AREA_GUIDES.map((g) => ({ slug: g.slug }))
}

const OUTSIDE_KAMPALA = new Set(['wakiso', 'mukono'])

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getAreaGuideBySlug(slug)
  if (!guide) return { title: 'Area guide' }
  const place = OUTSIDE_KAMPALA.has(guide.slug) ? guide.name : `${guide.name}, Kampala`
  const title = `Houses & Land in ${place}: Rent or Buy`
  const description =
    guide.summary.length <= 155
      ? guide.summary
      : `${guide.summary.slice(0, 154).replace(/\s+\S*$/, '')}…`
  return {
    title,
    description,
    alternates: { canonical: `/areas/${guide.slug}/` },
    openGraph: {
      title,
      description,
      url: `/areas/${guide.slug}/`,
      siteName: 'Mojesu Properties',
      locale: 'en_UG',
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
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

  const [properties, taxonomy] = await Promise.all([getProperties(), getTaxonomyContent()])
  const stats = areaStats(properties, guide.name)
  const neighbours = AREA_GUIDES.filter((g) => g.tier === guide.tier && g.slug !== guide.slug)

  return (
    <main className="min-h-screen bg-background">
      <AreaGuideJsonLd guide={guide} listingSlugs={stats.items.map((p) => p.slug)} />
      <SiteHeader />
      <AreaGuideView
        guide={guide}
        stats={stats}
        cards={stats.items.map((p) => toPropertyCardData(p, taxonomy))}
        neighbours={neighbours}
      />
      <SiteFooter />
    </main>
  )
}
