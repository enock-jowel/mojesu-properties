/**
 * Canonical public site origin (no trailing slash).
 * Production must set NEXT_PUBLIC_SITE_URL (or SITE_URL).
 */
export function siteUrl(): string | null {
  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    ''
  ).trim()
  if (!raw) return null
  return raw.replace(/\/$/, '')
}

/** Origin for invites / absolute redirects. Dev may fall back to localhost. */
export function siteUrlOrDevFallback(): string {
  const url = siteUrl()
  if (url) return url
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL (or SITE_URL) must be set in production.',
    )
  }
  return 'http://localhost:3000'
}
