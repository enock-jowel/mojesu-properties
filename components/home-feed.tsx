import {
  demandScore,
  filterProperties,
  getCoverImage,
  imageUrl,
  type Property,
} from '@/lib/properties'
import { toPropertyCardData } from '@/lib/property-card-data'
import type { Review } from '@/lib/reviews'
import type { BlogPost } from '@/lib/blog'
import type { Agent } from '@/lib/agents'
import type { ServiceDetail } from '@/lib/services'
import type {
  AreasContent,
  HomeContent,
  TaxonomyContent,
} from '@/lib/site-content/types'
import { ListingCarouselRow } from '@/components/listing-carousel-row'
import { HomeCarouselCards } from '@/components/home-carousel-cards'
import { ServicesGrid } from '@/components/services-grid'
import { ReviewsSection } from '@/components/reviews-section'
import { AgentsSection } from '@/components/agents-section'
import { BlogSection } from '@/components/blog-section'

function carouselPreviews(items: Property[]) {
  return items.slice(0, 3).map((item) => {
    const cover = getCoverImage(item.images)
    return {
      url: imageUrl(cover),
      alt: cover?.alt || item.title,
      title: item.title,
    }
  })
}

function toCards(items: Property[], taxonomy: TaxonomyContent) {
  return items.map((p) => toPropertyCardData(p, taxonomy))
}

export function HomeFeed({
  properties,
  services,
  reviews,
  reviewAggregate,
  agents,
  posts,
  home,
  areas,
  taxonomy,
}: {
  properties: Property[]
  services: ServiceDetail[]
  reviews: Review[]
  reviewAggregate?: { average: number; count: number } | null
  agents: Agent[]
  posts: BlogPost[]
  home: HomeContent
  areas: AreasContent
  taxonomy: TaxonomyContent
}) {
  const featuredFull = filterProperties(properties, { isFeatured: true }).slice(
    0,
    10,
  )
  const highDemandFull = [...properties]
    .sort((a, b) => demandScore(b) - demandScore(a))
    .slice(0, 10)
  const landFull = filterProperties(properties, {
    category: 'land',
    listingMode: 'sale',
  }).slice(0, 10)

  const midMarketSet = new Set(
    areas.midMarketRentalAreas.map((a) => a.toLowerCase()),
  )
  const popularRentalsFull = filterProperties(properties, {
    listingMode: 'rent',
    category: 'property',
    useClass: 'residential',
  })
    .filter((p) => midMarketSet.has(p.area.toLowerCase()))
    .sort((a, b) => demandScore(b) - demandScore(a))
    .slice(0, 10)

  const commercialFull = filterProperties(properties, {
    category: 'property',
    useClass: 'commercial',
  }).slice(0, 10)

  const featured = toCards(featuredFull, taxonomy)
  const highDemand = toCards(highDemandFull, taxonomy)
  const landForSale = toCards(landFull, taxonomy)
  const popularRentals = toCards(popularRentalsFull, taxonomy)
  const commercial = toCards(commercialFull, taxonomy)

  return (
    <div className="pb-4 pt-8 sm:pb-16 sm:pt-10">
      <ListingCarouselRow
        title={home.carousels.featured.title}
        subtitle={home.carousels.featured.subtitle}
        seeAllHref="/buy/?featured=1"
        seeAllPreviews={carouselPreviews(featuredFull)}
      >
        <HomeCarouselCards items={featured} />
      </ListingCarouselRow>

      <ListingCarouselRow
        title={home.carousels.highDemand.title}
        subtitle={home.carousels.highDemand.subtitle}
        seeAllHref="/rent/"
        seeAllPreviews={carouselPreviews(highDemandFull)}
      >
        <HomeCarouselCards items={highDemand} />
      </ListingCarouselRow>

      <ListingCarouselRow
        title={home.carousels.land.title}
        subtitle={home.carousels.land.subtitle}
        seeAllHref="/land/"
        seeAllPreviews={carouselPreviews(landFull)}
      >
        <HomeCarouselCards items={landForSale} />
      </ListingCarouselRow>

      <ListingCarouselRow
        title={home.carousels.popularRentals.title}
        subtitle={home.carousels.popularRentals.subtitle}
        seeAllHref="/rent/?use=residential"
        seeAllPreviews={carouselPreviews(popularRentalsFull)}
      >
        <HomeCarouselCards items={popularRentals} />
      </ListingCarouselRow>

      <ListingCarouselRow
        title={home.carousels.commercial.title}
        subtitle={home.carousels.commercial.subtitle}
        seeAllHref="/buy/?use=commercial"
        seeAllPreviews={carouselPreviews(commercialFull)}
      >
        <HomeCarouselCards items={commercial} />
      </ListingCarouselRow>

      <ServicesGrid services={services} intro={home.sections.services} />
      <ReviewsSection
        reviews={reviews}
        intro={home.sections.reviews}
        aggregate={reviewAggregate}
      />
      <AgentsSection agents={agents} intro={home.sections.agents} />
      <BlogSection posts={posts} intro={home.sections.insights} />
    </div>
  )
}
