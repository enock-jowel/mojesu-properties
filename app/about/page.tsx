import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AboutPage } from '@/components/about-page'
import { AboutFaq } from '@/components/about-faq'
import { getAgents } from '@/lib/agents'
import { FaqJsonLd } from '@/components/seo/faq-json-ld'
import {
  getAboutContent,
  getCompanyContent,
  getContactContent,
  getHomeContent,
} from '@/lib/site-content/queries'

export const metadata: Metadata = {
  title: 'About — Real Estate Experts in Kampala',
  description:
    'Mojesu helps renters, buyers, and investors find homes and land across Kampala with local expertise, verified listings, and end-to-end support.',
  alternates: { canonical: '/about/' },
}

export const revalidate = 60

export default async function AboutRoute() {
  const [agents, content, company, contact, home] = await Promise.all([
    getAgents(),
    getAboutContent(),
    getCompanyContent(),
    getContactContent(),
    getHomeContent(),
  ])

  return (
    <main className="min-h-screen bg-background">
      <FaqJsonLd
        faqs={content.faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />
      <SiteHeader />
      <AboutPage
        agents={agents}
        content={content}
        company={company}
        contact={contact}
        agentsIntro={home.sections.agents}
      />
      <AboutFaq faqs={content.faqs} />
      <SiteFooter />
    </main>
  )
}
