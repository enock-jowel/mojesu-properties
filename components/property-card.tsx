'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import {
  formatPriceUgx,
  getCoverImage,
  imageUrl,
  priceSuffix,
  type Property,
} from '@/lib/properties'
import type { PropertyCardData } from '@/lib/property-card-data'
import {
  useListingKindLabel,
  useTaxonomy,
} from '@/components/site-catalog-provider'

function isFullProperty(item: Property | PropertyCardData): item is Property {
  return Array.isArray((item as Property).images)
}

function CardShell({
  index,
  compact,
  href,
  imageSrc,
  imageAlt,
  priority,
  listingMode,
  titleStatusLabel,
  title,
  kindLabel,
  area,
  category,
  useClass,
  plotDimensions,
  bedrooms,
  bathrooms,
  sizeSqm,
  priceUgx,
  priceExtra,
  isFav,
  heartPop,
  onFav,
}: {
  index: number
  compact: boolean
  href: string
  imageSrc: string
  imageAlt: string
  priority: boolean
  listingMode: 'rent' | 'sale'
  titleStatusLabel?: string
  title: string
  kindLabel: string
  area: string
  category: 'property' | 'land'
  useClass?: string
  plotDimensions?: string
  bedrooms?: number
  bathrooms?: number
  sizeSqm?: number
  priceUgx: number
  priceExtra?: string | null
  isFav: boolean
  heartPop: boolean
  onFav: (e: React.SyntheticEvent) => void
}) {
  return (
    <div
      style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
      className={`animate-card-in group relative w-full text-left ${
        compact ? 'w-full' : ''
      }`}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[1/0.92] overflow-hidden rounded-2xl bg-surface-alt">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes={
              compact
                ? '(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 200px'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px'
            }
            quality={65}
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none sm:left-3 sm:top-3 sm:px-2.5 sm:py-0.5 sm:text-[11px] ${
              listingMode === 'rent'
                ? 'bg-pill-soft-mid text-ink'
                : 'bg-pill-soft text-secondary'
            }`}
          >
            {listingMode === 'rent' ? 'For rent' : 'For sale'}
          </span>
          {titleStatusLabel ? (
            <span className="absolute bottom-2 right-2 rounded-full bg-pill-title-status px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wide text-secondary shadow-sm sm:bottom-2.5 sm:right-2.5 sm:text-[10px]">
              {titleStatusLabel}
            </span>
          ) : null}
        </div>

        <div className="pt-3">
          <p className="truncate text-[15.5px] font-bold leading-tight text-ink">
            {title}
          </p>
          <p className="mb-2 mt-0.5 truncate text-sm text-neutral-muted">
            {kindLabel} · {area}
          </p>

          <div className="mb-1.5 flex flex-nowrap items-center gap-3 overflow-hidden text-[13.5px] text-neutral-muted">
            {category === 'land' ? (
              <span className="flex min-w-0 items-center gap-1 truncate">
                <i
                  className="fi fi-sr-ruler-combined shrink-0 text-[14px] leading-none opacity-70"
                  aria-hidden
                />
                <span className="truncate">{plotDimensions}</span>
              </span>
            ) : useClass === 'residential' ? (
              <>
                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                  <i
                    className="fi fi-sr-bed text-[14px] leading-none opacity-70"
                    aria-hidden
                  />{' '}
                  {bedrooms}
                </span>
                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                  <i
                    className="fi fi-sr-bath text-[14px] leading-none opacity-70"
                    aria-hidden
                  />{' '}
                  {bathrooms}
                </span>
                {listingMode === 'sale' ? (
                  <span className="flex min-w-0 items-center gap-1 truncate">
                    <i
                      className="fi fi-sr-expand shrink-0 text-[14px] leading-none opacity-70"
                      aria-hidden
                    />{' '}
                    <span className="truncate">{sizeSqm} m²</span>
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                  <i
                    className="fi fi-sr-expand text-[14px] leading-none opacity-70"
                    aria-hidden
                  />
                  {sizeSqm} m²
                </span>
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <i
                    className="fi fi-sr-building shrink-0 text-[14px] leading-none opacity-70"
                    aria-hidden
                  />
                  <span className="truncate">{kindLabel}</span>
                </span>
              </>
            )}
          </div>

          <p className="truncate whitespace-nowrap text-[12.5px] font-bold leading-tight text-ink sm:text-[15px]">
            {formatPriceUgx(priceUgx)}
            {priceExtra ? (
              <span className="font-normal text-neutral-muted"> {priceExtra}</span>
            ) : null}
          </p>
        </div>
      </Link>

      <button
        type="button"
        aria-label={isFav ? 'Remove from saved' : 'Save listing'}
        aria-pressed={isFav}
        onClick={onFav}
        className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center"
      >
        <Heart
          className={`h-[20px] w-[20px] transition-colors ${
            isFav
              ? 'fill-heart text-heart stroke-heart'
              : 'fill-none stroke-[1.75] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]'
          } ${heartPop ? 'animate-heart-pop' : ''}`}
        />
      </button>
    </div>
  )
}

function PropertyCardFromFull({
  item,
  index,
  isFav,
  onToggleFav,
  compact,
  priority,
}: {
  item: Property
  index: number
  isFav: boolean
  onToggleFav: (id: string) => void
  compact: boolean
  priority: boolean
}) {
  const image = getCoverImage(item.images)
  const kindLabel = useListingKindLabel(item)
  const { titleStatus } = useTaxonomy()
  const [heartPop, setHeartPop] = useState(false)
  const suffix = priceSuffix(item)

  return (
    <CardShell
      index={index}
      compact={compact}
      href={`/listings/${item.slug}/`}
      imageSrc={imageUrl(image)}
      imageAlt={image?.alt || item.title}
      priority={priority}
      listingMode={item.listingMode}
      titleStatusLabel={
        item.listingMode === 'sale' && item.titleStatus
          ? titleStatus[item.titleStatus] || item.titleStatus
          : undefined
      }
      title={item.title}
      kindLabel={kindLabel}
      area={item.area}
      category={item.category}
      useClass={item.category === 'property' ? item.useClass : undefined}
      plotDimensions={item.category === 'land' ? item.plotDimensions : undefined}
      bedrooms={'bedrooms' in item ? item.bedrooms : undefined}
      bathrooms={'bathrooms' in item ? item.bathrooms : undefined}
      sizeSqm={'sizeSqm' in item ? item.sizeSqm : undefined}
      priceUgx={item.priceUgx}
      priceExtra={suffix || (item.listingMode === 'rent' ? '/ month' : null)}
      isFav={isFav}
      heartPop={heartPop}
      onFav={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isFav) {
          setHeartPop(true)
          window.setTimeout(() => setHeartPop(false), 160)
        }
        onToggleFav(item.id)
      }}
    />
  )
}

function PropertyCardFromData({
  item,
  index,
  isFav,
  onToggleFav,
  compact,
  priority,
}: {
  item: PropertyCardData
  index: number
  isFav: boolean
  onToggleFav: (id: string) => void
  compact: boolean
  priority: boolean
}) {
  const { titleStatus } = useTaxonomy()
  const [heartPop, setHeartPop] = useState(false)

  return (
    <CardShell
      index={index}
      compact={compact}
      href={`/listings/${item.slug}/`}
      imageSrc={item.coverUrl}
      imageAlt={item.coverAlt}
      priority={priority}
      listingMode={item.listingMode}
      titleStatusLabel={
        item.listingMode === 'sale' && item.titleStatus
          ? titleStatus[item.titleStatus] || item.titleStatus
          : undefined
      }
      title={item.title}
      kindLabel={item.kindLabel}
      area={item.area}
      category={item.category}
      useClass={item.useClass}
      plotDimensions={item.plotDimensions}
      bedrooms={item.bedrooms}
      bathrooms={item.bathrooms}
      sizeSqm={item.sizeSqm}
      priceUgx={item.priceUgx}
      priceExtra={item.listingMode === 'rent' ? '/ month' : null}
      isFav={isFav}
      heartPop={heartPop}
      onFav={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isFav) {
          setHeartPop(true)
          window.setTimeout(() => setHeartPop(false), 160)
        }
        onToggleFav(item.id)
      }}
    />
  )
}

export function PropertyCard({
  item,
  index,
  isFav,
  onToggleFav,
  compact = false,
  priority = false,
}: {
  item: Property | PropertyCardData
  index: number
  isFav: boolean
  onToggleFav: (id: string) => void
  compact?: boolean
  priority?: boolean
}) {
  if (isFullProperty(item)) {
    return (
      <PropertyCardFromFull
        item={item}
        index={index}
        isFav={isFav}
        onToggleFav={onToggleFav}
        compact={compact}
        priority={priority}
      />
    )
  }
  return (
    <PropertyCardFromData
      item={item}
      index={index}
      isFav={isFav}
      onToggleFav={onToggleFav}
      compact={compact}
      priority={priority}
    />
  )
}
