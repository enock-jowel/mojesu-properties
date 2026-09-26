import type { ImageLoader } from 'next/image'

/** Cloudinary delivery URL: `https://res.cloudinary.com/<cloud>/image/upload/...` */
export function isCloudinaryUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname === 'res.cloudinary.com' && u.pathname.includes('/image/upload/')
  } catch {
    return false
  }
}

/**
 * Rewrite a Cloudinary URL so Cloudinary resizes and picks AVIF/WebP itself.
 * Transformation segments pasted with the URL are dropped so ours can't be
 * overridden (e.g. a pasted `w_2000` would upscale a card image).
 */
function cloudinarySized(u: URL, width: number): string {
  const [before, after] = u.pathname.split('/image/upload/')
  const segments = after.split('/')
  let i = 0
  while (
    i < segments.length - 1 &&
    !/^v\d+$/.test(segments[i]) &&
    /^[a-z]{1,3}_[^/]*$/.test(segments[i].split(',')[0])
  ) {
    i += 1
  }
  const rest = segments.slice(i).join('/')
  u.pathname = `${before}/image/upload/f_auto,q_auto:eco,c_limit,w_${width}/${rest}`
  u.search = ''
  return u.toString()
}

/** Keep in sync with `images.remotePatterns` in next.config.ts and CSP img-src. */
const LISTING_IMAGE_HOSTS = [
  /^res\.cloudinary\.com$/,
  /\.supabase\.co$/,
  /^images\.unsplash\.com$/,
]

/** Listing photos must come from a host `next/image` is configured for. */
export function isAllowedListingImageUrl(url: string): boolean {
  try {
    const u = new URL(url.trim())
    return (
      u.protocol === 'https:' &&
      LISTING_IMAGE_HOSTS.some((re) => re.test(u.hostname))
    )
  } catch {
    return false
  }
}

/** Resize common remote image CDNs for the displayed width. */
export function sizedImageUrl(url: string, width: number, quality = 55): string {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return url
  try {
    const u = new URL(url)
    if (isCloudinaryUrl(url)) return cloudinarySized(u, width)
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

/** `srcSet` for plain `<img>` tags so phones don't download desktop widths. */
export function sizedImageSrcSet(
  url: string,
  widths: number[],
  quality = 55,
): string | undefined {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return undefined
  const sized = widths.map((w) => sizedImageUrl(url, w, quality))
  if (sized[0] === url) return undefined
  return sized.map((s, i) => `${s} ${widths[i]}w`).join(', ')
}

/** Spread onto `<img>`: largest width as `src`, plus `srcSet`/`sizes`. */
export function responsiveImg(
  url: string,
  widths: number[],
  sizes: string,
  quality = 55,
): { src: string; srcSet?: string; sizes?: string } {
  const srcSet = sizedImageSrcSet(url, widths, quality)
  return {
    src: sizedImageUrl(url, widths[widths.length - 1], quality),
    ...(srcSet ? { srcSet, sizes } : {}),
  }
}

const cdnLoader: ImageLoader = ({ src, width, quality }) =>
  sizedImageUrl(src, width, quality ?? 55)

/**
 * `next/image` loader for Cloudinary so it resizes on its own CDN instead of
 * our server. Undefined → Next's built-in optimizer handles the image
 * (Unsplash stays there: its WebP at the same width is ~50% heavier).
 */
export function cdnLoaderFor(src: string): ImageLoader | undefined {
  return isCloudinaryUrl(src) ? cdnLoader : undefined
}
