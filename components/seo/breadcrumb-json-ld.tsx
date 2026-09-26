const siteOrigin = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://mojesuproperties.com').replace(/\/$/, '')

/** `items` paths are site-relative, e.g. `/areas/`. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  if (!items.length) return null
  const origin = siteOrigin()
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
