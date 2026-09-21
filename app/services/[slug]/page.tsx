import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ServiceDetailPage } from '@/components/service-detail-page'
import { getAllServices, getOtherServices, getServiceBySlug } from '@/lib/services'

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
  if (!service) return { title: 'Service — Mojesu' }

  return {
    title: `${service.name} — Mojesu Services`,
    description: service.heroDescription,
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
      <SiteHeader />
      <ServiceDetailPage service={service} others={others} />
      <SiteFooter />
    </main>
  )
}
