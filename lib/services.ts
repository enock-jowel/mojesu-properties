/**
 * Service offerings — public getters read published rows from Supabase only.
 * Seed catalog: scripts/seed-data/services-catalog.ts
 */

import {
  fetchPublishedServiceBySlug,
  fetchPublishedServices,
} from '@/lib/content/queries'

export type ServiceId =
  | 'property-management'
  | 'valuation'
  | 'surveying'
  | 'agent-search'
  | 'development'
  | 'facilities'

export type ServiceOfferingItem = {
  title: string
  description: string
  /** Flaticon uicons-regular-rounded class, e.g. fi-rr-search */
  iconClass: string
}

export type ServiceProcessStep = {
  title: string
  description: string
}

/** Choice / text fields shown on the first enquiry step (service-specific). */
export type ServiceEnquiryField = {
  id: string
  label: string
  /** text input, or choice chips */
  type: 'text' | 'choice'
  placeholder?: string
  required?: boolean
  options?: string[]
}

export type ServiceEnquiryConfig = {
  /** Primary CTA on the idle card */
  ctaLabel: string
  /** Card headline above the form */
  cardTitle: string
  /** Short line under the title */
  cardSubtitle: string
  /** Title for the purpose / brief step */
  briefStepTitle: string
  fields: ServiceEnquiryField[]
  /** Helper under the form after submit CTA */
  footerNote: string
  /** Review pass label */
  reviewLabel: string
}

export type ServiceDetail = {
  id: ServiceId
  slug: string
  name: string
  /** One-line card blurb */
  description: string
  /** Hero paragraph under the title */
  heroDescription: string
  image: string
  imageAlt: string
  /** Flaticon solid-rounded for landing card overlay */
  iconClass: string
  enquiry: ServiceEnquiryConfig
  whatWeDo: {
    title: string
    body: string
    image: string
    imageAlt: string
  }
  offerings: {
    title: string
    body: string
    items: ServiceOfferingItem[]
  }
  process: {
    title: string
    body: string
    image: string
    imageAlt: string
    steps: ServiceProcessStep[]
  }
}

export async function getAllServices(): Promise<ServiceDetail[]> {
  const fromDb = await fetchPublishedServices()
  return fromDb ?? []
}

export async function getServiceBySlug(
  slug: string,
): Promise<ServiceDetail | undefined> {
  const fromDb = await fetchPublishedServiceBySlug(slug)
  if (fromDb) return fromDb
  const list = await fetchPublishedServices()
  if (list === null) return undefined
  return list.find((s) => s.slug === slug)
}

export async function getOtherServices(slug: string): Promise<ServiceDetail[]> {
  const all = await getAllServices()
  return all.filter((s) => s.slug !== slug)
}
