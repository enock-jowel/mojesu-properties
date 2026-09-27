import type { ServiceDetail } from '@/lib/services'

/**
 * Search-intent titles/descriptions per service. Copy restates claims already
 * on each service page — nothing new is promised. Titles ≤51 chars because
 * the root layout appends " — Mojesu"; descriptions ≤155.
 */
const SERVICE_SEO: Record<string, { title: string; description: string }> = {
  'property-management': {
    title: 'Property Management in Kampala for Landlords',
    description:
      'Property management in Kampala: tenant placement, rent collection, maintenance coordination and clear reporting for landlords. Talk to Mojesu.',
  },
  valuation: {
    title: 'Property Valuation Services in Kampala',
    description:
      'Property valuation in Kampala for sale, mortgage or insurance — grounded market valuations and clear advice from the Mojesu team.',
  },
  surveying: {
    title: 'Land Surveying & Title Verification in Kampala',
    description:
      'Verify boundaries, beacons and land title status in Kampala before money changes hands. Land surveying and title checks by Mojesu.',
  },
  'agent-search': {
    title: 'Agent-Assisted House Hunting in Kampala',
    description:
      'A dedicated Mojesu agent shortlists homes in Kampala that fit your budget and preferred neighbourhoods, then coordinates your viewings.',
  },
  development: {
    title: 'Development Consulting for Land in Kampala',
    description:
      'Planning to build in Kampala? Feasibility, sequencing and cost-realism guidance before you commit to drawings and contractors.',
  },
  facilities: {
    title: 'Facilities Management Services in Kampala',
    description:
      'Facilities management in Kampala for commercial and multi-unit property: cleaning, security coordination, vendor oversight and daily operations.',
  },
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—-]$/, '')}…`
}

export function serviceSeoTitle(service: ServiceDetail): string {
  return SERVICE_SEO[service.id]?.title ?? clip(`${service.name} in Kampala`, 51)
}

export function serviceSeoDescription(service: ServiceDetail): string {
  return SERVICE_SEO[service.id]?.description ?? clip(service.heroDescription, 155)
}
