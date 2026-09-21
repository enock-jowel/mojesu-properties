/** Resize common remote image CDNs for the displayed width. */
export function sizedImageUrl(url: string, width: number, quality = 65): string {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return url
  try {
    const u = new URL(url)
    if (u.hostname.includes('unsplash.com')) {
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      u.searchParams.set('w', String(width))
      u.searchParams.set('q', String(quality))
      return u.toString()
    }
    if (u.hostname.includes('framerusercontent.com')) {
      u.searchParams.set('width', String(width))
      return u.toString()
    }
    // Supabase Storage public objects → image transform (free on project)
    if (
      u.hostname.includes('supabase.co') &&
      u.pathname.includes('/storage/v1/object/public/')
    ) {
      u.pathname = u.pathname.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/',
      )
      u.searchParams.set('width', String(width))
      u.searchParams.set('quality', String(quality))
      u.searchParams.set('resize', 'contain')
      return u.toString()
    }
  } catch {
    /* keep original */
  }
  return url
}
