import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListWithUsPage } from '@/components/list-with-us-page'
import { FaqJsonLd } from '@/components/seo/faq-json-ld'
import { getAllServices } from '@/lib/services'
import { getListWithUsContent } from '@/lib/site-content/queries'

export const metadata: Metadata = {
  title: 'List With Us — Request a Property Visit',
  description:
    'Request Mojesu to visit, verify, and list your property for rent or sale in Kampala. Our team handles photography and listing creation for you.',
  alternates: { canonical: '/list-with-us/' },
}

export const revalidate = 60

export default async function ListWithUsRoute() {
  const [services, content] = await Promise.all([
    getAllServices(),
    getListWithUsContent(),
  ])
  const relatedServices = content.relatedServiceSlugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const faqs = [
    {
      question: 'What happens when I list with Mojesu?',
      answer: content.whatWeDo.body,
    },
    {
      question: 'How quickly will Mojesu contact me?',
      answer: content.cardSubtitle,
    },
    {
      question: 'Does my property go live automatically?',
      answer: content.footerNote,
    },
    ...content.process.steps.map((s) => ({
      question: s.title,
      answer: s.description,
    })),
  ]

  return (
    <main className="min-h-screen bg-background">
      <FaqJsonLd faqs={faqs} />
      <SiteHeader />
      <ListWithUsPage
        relatedServices={relatedServices}
        content={content}
      />
      <SiteFooter />
    </main>
  )
}
