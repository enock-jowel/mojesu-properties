'use client'

import Link from 'next/link'
import { CAROUSEL_CARD_WIDTH } from '@/components/carousel-see-more-card'
import { useImagesVisible } from '@/components/deferred-images'
import { RoofMark } from '@/components/roof-mark'
import { responsiveImg } from '@/lib/media'

export type HomeAreaCard = {
  slug: string
  name: string
  tierLabel: string
  coverUrl: string | null
  count: number
  countLabel: string
}

export function HomeAreaCards({ items }: { items: HomeAreaCard[] }) {
  const showImages = useImagesVisible()
  return (
    <>
      {items.map((area, i) => (
        <div key={area.slug} className={`${CAROUSEL_CARD_WIDTH}${i >= 4 ? ' max-sm:hidden' : ''}`}>
          <Link href={`/areas/${area.slug}/`} className="group block text-left">
            <div className="relative aspect-[1/0.92] overflow-hidden rounded-2xl bg-surface-alt">
              {area.coverUrl && showImages ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...responsiveImg(area.coverUrl, [240, 360, 480], '(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 200px')}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              ) : !area.coverUrl ? (
                <div className="flex h-full w-full items-center justify-center">
                  <RoofMark className="h-9 w-9 text-neutral-muted/40" />
                </div>
              ) : null}
              <span className="absolute left-2.5 top-2.5 rounded-full bg-pill-soft-mid px-2 py-0.5 text-[10px] font-bold leading-none text-ink sm:left-3 sm:top-3 sm:px-2.5 sm:text-[11px]">
                {area.count} listing{area.count === 1 ? '' : 's'}
              </span>
            </div>
            <div className="pt-3">
              <p className="truncate text-[15.5px] font-bold leading-tight text-ink transition-colors group-hover:text-primary-dark">
                {area.name}
              </p>
              <p className="mt-0.5 truncate text-sm text-neutral-muted">{area.tierLabel} area</p>
              <p className="mt-1.5 truncate text-[12.5px] font-semibold text-ink/80 sm:text-[13.5px]">
                {area.countLabel}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </>
  )
}
