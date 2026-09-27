import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ServiceDetailPage } from '@/components/service-detail-page'
import { ServiceJsonLd } from '@/components/seo/service-json-ld'
import { getAllServices, getOtherServices, getServiceBySlug } from '@/lib/services'
import { serviceSeoDescription, serviceSeoTitle } from '@/lib/seo/service-meta'

export const revalidate = 60

export async function generateStaticParams() {
  const services = await getAllServices()
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service' }

  const title = serviceSeoTitle(service)
  const description = serviceSeoDescription(service)
  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}/` },
    openGraph: {
      title,
      description,
      url: `/services/${service.slug}/`,
      images: [{ url: service.image, alt: service.imageAlt }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const others = await getOtherServices(service.slug)

  return (
    <main className="min-h-screen bg-background">
      <ServiceJsonLd service={service} description={serviceSeoDescription(service)} />
      <SiteHeader />
      <ServiceDetailPage service={service} others={others} />
      <SiteFooter />
    </main>
  )
}
