import {
  getCoverImage,
  imageUrl,
  type ListingMode,
  type Property,
  type PropertyCategory,
  type TitleStatus,
  type UseClass,
} from '@/lib/properties'
import { listingKindLabelFrom } from '@/lib/site-content/catalog-helpers'
import type { TaxonomyContent } from '@/lib/site-content/catalog-types'

/** Minimal listing fields for home/browse cards — keeps RSC client props tiny. */
export type PropertyCardData = {
  id: string
  slug: string
  title: string
  listingMode: ListingMode
  category: PropertyCategory
  useClass?: UseClass
  area: string
  priceUgx: number
  coverUrl: string
  coverAlt: string
  kindLabel: string
  titleStatus?: TitleStatus
  bedrooms?: number
  bathrooms?: number
  sizeSqm?: number
  plotDimensions?: string
}

export function toPropertyCardData(
  item: Property,
  taxonomy: TaxonomyContent,
): PropertyCardData {
  const cover = getCoverImage(item.images)
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    listingMode: item.listingMode,
    category: item.category,
    useClass: item.category === 'property' ? item.useClass : undefined,
    area: item.area,
    priceUgx: item.priceUgx,
    coverUrl: imageUrl(cover),
    coverAlt: cover?.alt || item.title,
    kindLabel: listingKindLabelFrom(item, taxonomy),
    titleStatus: item.listingMode === 'sale' ? item.titleStatus : undefined,
    bedrooms: 'bedrooms' in item ? item.bedrooms : undefined,
    bathrooms: 'bathrooms' in item ? item.bathrooms : undefined,
    sizeSqm: 'sizeSqm' in item ? item.sizeSqm : undefined,
    plotDimensions:
      item.category === 'land' ? item.plotDimensions : undefined,
  }
}
