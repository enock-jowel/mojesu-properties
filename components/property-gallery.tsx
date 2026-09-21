'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  imageUrl,
  orderedImages,
  type Property,
  type PropertyImage,
} from '@/lib/properties'

/**
 * Hero gallery: big cover (~50% width) + 2×2 tile of four photos.
 * Extra photos appear as a “+N” / “Show all” count on the last tile.
 */
export function PropertyGallery({ item }: { item: Property }) {
  const images = orderedImages(item.images)
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [mobileIdx, setMobileIdx] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const hero = images[0]
  const tileFour = images.slice(1, 5)
  const moreCount = Math.max(0, images.length - 5)

  const openAt = useCallback((idx: number) => {
    setLightboxIdx(idx)
    setLightbox(true)
  }, [])

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight')
        setLightboxIdx((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft')
        setLightboxIdx((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, images.length])

  function onMobileScroll() {
    const el = scrollerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    setMobileIdx(Math.round(el.scrollLeft / w))
  }

  return (
    <>
      {/* Mobile carousel */}
      <div className="relative md:hidden">
        <div
          ref={scrollerRef}
          onScroll={onMobileScroll}
          className="allow-x-scroll flex snap-x snap-mandatory overflow-x-auto rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => {
            /* Only hydrate ±1 of active slide — cuts multi‑MB 3G gallery payloads */
            const mountImage = i === 0 || Math.abs(i - mobileIdx) <= 1
            return (
              <button
                key={`${imageUrl(img)}-m-${i}`}
                type="button"
                onClick={() => openAt(i)}
                className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden bg-surface-alt"
              >
                {mountImage ? (
                  <Image
                    src={imageUrl(img)}
                    alt={img.alt || `${item.title} photo ${i + 1}`}
                    fill
                    sizes="100vw"
                    quality={70}
                    priority={i === 0}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="object-cover"
                  />
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === mobileIdx ? 'w-4 bg-primary' : 'w-1.5 bg-neutral-light'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => openAt(mobileIdx)}
          className="absolute bottom-10 right-3 rounded-full bg-surface px-3.5 py-2 text-xs font-bold text-ink shadow-md"
        >
          Show all {images.length} photos →
        </button>
      </div>

      {/* Desktop: 50% hero | 50% 2×2 tile */}
      <div className="relative hidden md:block">
        <div className="grid h-[360px] grid-cols-2 gap-2 lg:h-[440px]">
          {/* Big cover — half width, full height */}
          <button
            type="button"
            onClick={() => openAt(0)}
            className="relative overflow-hidden rounded-2xl"
          >
            {hero ? (
              <Image
                src={imageUrl(hero)}
                alt={hero.alt || item.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                quality={75}
                priority
                fetchPriority="high"
                className="object-cover"
              />
            ) : null}
            {hero?.roomTag ? (
              <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
                {hero.roomTag}
              </span>
            ) : null}
          </button>

          {/* Tile of four — square joins inside, round only on outer group */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
            {tileFour.map((img, i) => {
              const absIdx = i + 1
              const isLast = i === tileFour.length - 1
              const showMoreOverlay = isLast && moreCount > 0
              return (
                <button
                  key={`${imageUrl(img)}-t-${i}`}
                  type="button"
                  onClick={() => openAt(showMoreOverlay ? 5 : absIdx)}
                  className="relative overflow-hidden rounded-none"
                >
                  <Image
                    src={imageUrl(img)}
                    alt={img.alt || `${item.title} photo ${absIdx + 1}`}
                    fill
                    sizes="25vw"
                    quality={65}
                    loading="lazy"
                    className="object-cover"
                  />
                  {img.roomTag && !showMoreOverlay ? (
                    <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-semibold text-ink">
                      {img.roomTag}
                    </span>
                  ) : null}
                  {showMoreOverlay ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-accent-deep/55 text-base font-extrabold text-white">
                      +{moreCount} more
                    </span>
                  ) : null}
                </button>
              )
            })}
            {/* Pad empty cells if fewer than 4 side images */}
            {Array.from({ length: Math.max(0, 4 - tileFour.length) }).map(
              (_, i) => (
                <div key={`pad-${i}`} className="bg-surface-alt" />
              ),
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 right-3 rounded-full bg-surface px-3.5 py-2 text-xs font-bold text-ink shadow-md transition-colors hover:bg-surface-alt"
        >
          Show all {images.length} photos →
        </button>
      </div>

      {lightbox ? (
        <Lightbox
          images={images}
          title={item.title}
          index={lightboxIdx}
          setIndex={setLightboxIdx}
          onClose={() => setLightbox(false)}
        />
      ) : null}
    </>
  )
}

function Lightbox({
  images,
  title,
  index,
  setIndex,
  onClose,
}: {
  images: PropertyImage[]
  title: string
  index: number
  setIndex: (n: number | ((i: number) => number)) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-accent-deep/90"
      role="dialog"
      aria-modal="true"
      aria-label="Photo gallery"
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="text-sm font-bold text-white">
          {index + 1} / {images.length}
          {images[index]?.roomTag ? ` · ${images[index].roomTag}` : ''}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-8 sm:px-12">
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() =>
            setIndex((i) => (i - 1 + images.length) % images.length)
          }
          className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-ink shadow sm:left-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(images[index])}
          alt={images[index]?.alt || `${title} photo ${index + 1}`}
          className="max-h-[78vh] max-w-full rounded-xl object-contain"
        />
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
          className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-ink shadow sm:right-4"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="allow-x-scroll flex gap-2 overflow-x-auto px-4 pb-5 sm:justify-center sm:px-6">
        {images.map((img, i) => (
          <button
            key={`${imageUrl(img)}-lb-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ${
              i === index ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(img)}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
