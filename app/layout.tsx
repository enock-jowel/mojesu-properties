import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { LockHorizontalPagePan } from '@/components/lock-horizontal-page-pan'
import { SiteCatalogProvider } from '@/components/site-catalog-provider'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'
import { getCompanyContent, getSiteCatalog } from '@/lib/site-content/queries'
import { getReviewsPayload } from '@/lib/reviews'
import './globals.css'
/* Subset of Flaticon UIcons (~6KB CSS vs ~400KB full packs) — regenerate via pnpm uicons:subset */
import '../styles/uicons-subset.css'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Houses & Land for Rent and Sale in Kampala — Mojesu',
    template: '%s — Mojesu',
  },
  description:
    'Verified homes across Kampala for rent and for sale, in one place. Filter by town, price, rooms and house type, then book a viewing in minutes.',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    siteName: 'Mojesu',
    locale: 'en_UG',
    type: 'website',
  },
}

function supabaseHost(): string | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    return url ? new URL(url).origin : null
  } catch {
    return null
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Opt into request-time render so middleware nonces can stamp Next scripts (CSP).
  await headers()

  const [catalog, company, reviewsPayload] = await Promise.all([
    getSiteCatalog(),
    getCompanyContent(),
    getReviewsPayload(),
  ])
  const storageOrigin = supabaseHost()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {storageOrigin ? (
          <>
            <link rel="preconnect" href={storageOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={storageOrigin} />
          </>
        ) : null}
      </head>
      <body className="max-w-full overscroll-x-none">
        <OrganizationJsonLd
          company={company}
          reviews={reviewsPayload.reviews}
          aggregate={reviewsPayload.aggregate}
        />
        <LockHorizontalPagePan />
        <SiteCatalogProvider value={catalog}>{children}</SiteCatalogProvider>
        <Analytics />
      </body>
    </html>
  )
}
