'use client'

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

/** Keeps the alt text from painting inside the card before the photo loads. */
const BLANK_GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * Below-the-fold `<img>`. Native `loading="lazy"` starts fetching up to
 * 2500px early on slow connections, which steals bandwidth from the hero on
 * 3G; this waits until the image is within `margin` of the viewport.
 */
export function LazyImg({
  src,
  srcSet,
  sizes,
  margin = '300px',
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; margin?: string }) {
  const ref = useRef<HTMLImageElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near, margin])

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      {...rest}
      src={near ? src : BLANK_GIF}
      srcSet={near ? srcSet : undefined}
      sizes={near ? sizes : undefined}
      decoding="async"
    />
  )
}
