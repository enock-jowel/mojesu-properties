import type { MetadataRoute } from 'next'
import { getProperties } from '@/lib/properties'
import { getAllServices } from '@/lib/services'
import { getAllBlogPosts } from '@/lib/blog'
import { AREA_GUIDES, TIER_GUIDES } from '@/lib/area-guides'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://mojesuproperties.com'
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin()
  const [listings, services, posts] = await Promise.all([
    getProperties(),
    getAllServices(),
    getAllBlogPosts(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${origin}/rent/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${origin}/buy/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${origin}/land/`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${origin}/areas/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${origin}/services/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${origin}/insights/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${origin}/about/`, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${origin}/list-with-us/`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  const areaRoutes: MetadataRoute.Sitemap = [
    ...TIER_GUIDES.map((g) => ({
      url: `${origin}/areas/tier/${g.slug}/`,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
    ...AREA_GUIDES.map((g) => ({
      url: `${origin}/areas/${g.slug}/`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  const listingRoutes: MetadataRoute.Sitemap = listings.map((p) => ({
    url: `${origin}/listings/${p.slug}/`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${origin}/services/${s.slug}/`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const insightRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${origin}/insights/${p.slug}/`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [
    ...staticRoutes,
    ...areaRoutes,
    ...listingRoutes,
    ...serviceRoutes,
    ...insightRoutes,
  ]
}
