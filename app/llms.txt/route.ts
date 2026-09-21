const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'

export function GET() {
  const body = `# Mojesu

> Mojesu Properties International Ltd helps people rent and buy verified homes and land across Kampala, Uganda — with clear title-status information, local agents, and viewing bookings arranged online.

## Browse
- [Homes for rent](${site}/rent/)
- [Homes for sale](${site}/buy/)
- [Land](${site}/land/)

## Services & owners
- [Services](${site}/services/)
- [List with us](${site}/list-with-us/)
- [About Mojesu](${site}/about/)
- [Insights](${site}/insights/)
- [Contact](${site}/#contact)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
