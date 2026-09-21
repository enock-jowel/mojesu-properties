import type { MetadataRoute } from 'next'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
