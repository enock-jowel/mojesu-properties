import { SiteHeader } from '@/components/site-header'
import { HeroSearch } from '@/components/hero-search'
import { HomeFeed } from '@/components/home-feed'
import { CtaStrip } from '@/components/cta-strip'
import { ContactSection } from '@/components/contact-section'
import { SiteFooter } from '@/components/site-footer'
import { Toast } from '@/components/toast'
import { getProperties } from '@/lib/properties'
import { getBlogPosts } from '@/lib/blog'
import { getAgents } from '@/lib/agents'
import { getReviewsPayload } from '@/lib/reviews'
import { getAllServices } from '@/lib/services'
import {
  getAreasContent,
  getCompanyContent,
  getContactContent,
  getHomeContent,
  getTaxonomyContent,
} from '@/lib/site-content/queries'

export const revalidate = 60

export default async function Page() {
  const [
    properties,
    services,
    reviewsPayload,
    agents,
    posts,
    home,
    company,
    contact,
    areas,
    taxonomy,
  ] = await Promise.all([
    getProperties(),
    getAllServices(),
    getReviewsPayload(),
    getAgents(),
    getBlogPosts(4),
    getHomeContent(),
    getCompanyContent(),
    getContactContent(),
    getAreasContent(),
    getTaxonomyContent(),
  ])

  const heroSrc =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSearch
        backgroundSrc={heroSrc}
        backgroundAlt="Residential property in Kampala, Uganda"
      />
      <HomeFeed
        properties={properties}
        services={services}
        reviews={reviewsPayload.reviews}
        reviewAggregate={reviewsPayload.aggregate}
        agents={agents}
        posts={posts}
        home={home}
        areas={areas}
        taxonomy={taxonomy}
      />
      <CtaStrip />
      <ContactSection company={company} contact={contact} />
      <SiteFooter />
      <Toast />
    </main>
  )
}
