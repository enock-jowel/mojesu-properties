function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export type Crumb = { name: string; path: string }

/** BreadcrumbList node for embedding in a page's `@graph`. */
export function breadcrumbList(crumbs: Crumb[]) {
  const origin = siteOrigin()
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${origin}${c.path}`,
    })),
  }
}

/** Standalone BreadcrumbList script for pages without another JSON-LD graph. */
export function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const payload = { '@context': 'https://schema.org', ...breadcrumbList(crumbs) }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
