/**
 * Airbnb-style "Things to know" content — customized per listing category
 * and listing mode (rent vs sale, residential / commercial / land).
 */

import { type Property } from '@/lib/properties'
import type { AmenityKey } from '@/lib/amenities'
import {
  formatViewingPassBlurb,
  VIEWING_PASS_DAYS,
} from '@/lib/viewing-bookings'
import type { ViewingContent } from '@/lib/site-content/catalog-types'
import { DEFAULT_TAXONOMY } from '@/lib/site-content/catalog-defaults'

export type ThingsColumnId =
  | 'policy'
  | 'rules'
  | 'safety'

export type ThingsColumn = {
  id: ThingsColumnId
  title: string
  /** Short lines shown on the page (Airbnb preview style) */
  items: string[]
  /** Longer copy for the Learn more modal */
  details: string[]
}

export type ThingsToKnowOpts = {
  viewing?: ViewingContent
  titleStatus?: Record<string, string>
}

function hasAmenity(item: Property, key: AmenityKey): boolean {
  return (item.amenities ?? []).includes(key)
}

function titleLabel(
  item: Property,
  titleStatus: Record<string, string>,
): string {
  return item.titleStatus
    ? titleStatus[item.titleStatus] || item.titleStatus
    : 'Confirm with agent'
}

function viewingPolicy(
  item: Property,
  opts: ThingsToKnowOpts,
): ThingsColumn {
  const kindLabel =
    item.category === 'land'
      ? 'site visit'
      : item.useClass === 'commercial'
        ? 'unit viewing'
        : 'property viewing'

  const passDays = opts.viewing?.passDays ?? VIEWING_PASS_DAYS
  const blurb = opts.viewing
    ? formatViewingPassBlurb(opts.viewing)
    : formatViewingPassBlurb()

  return {
    id: 'policy',
    title: 'Cancellation policy',
    items: [
      `Free reschedule up to 24 hours before your ${kindLabel}.`,
      `Viewing pass is valid for ${passDays} days once confirmed.`,
      'No-shows without notice may forfeit that viewing slot.',
    ],
    details: [
      `${blurb}. Paid by MoMo or cash after confirmation.`,
      `You may reschedule free of charge up to 24 hours before the booked ${kindLabel}. Within 24 hours, we will try to rebook but cannot guarantee the same slot.`,
      'Cancellations after the first viewing on a pass has been used are non-refundable for remaining slots.',
      'Contact Mojesu on WhatsApp to change or cancel a booking.',
    ],
  }
}

function residentialRentRules(item: Property): ThingsColumn {
  const deposit = item.depositMonths ?? 2
  const lease = item.leaseTerm ?? '1 year renewable'
  const pets = hasAmenity(item, 'pets')
  const capacity =
    item.category === 'property' && item.useClass === 'residential'
      ? Math.max(item.bedrooms * 2, 2)
      : null

  const items = [
    `${deposit}-month security deposit on move-in`,
    `Lease: ${lease}`,
    pets ? 'Pets allowed with prior approval' : 'No pets without written approval',
  ]
  if (capacity) items.push(`${capacity} occupants maximum (typical)`)

  return {
    id: 'rules',
    title: 'House rules',
    items,
    details: [
      `Expect a ${deposit}-month security deposit, refundable subject to inspection at handover.`,
      `Standard lease term: ${lease}. Exact terms are confirmed before signing.`,
      pets
        ? 'This listing is marked pet-friendly. Confirm breed/size limits with Mojesu before bringing pets.'
        : 'Pets are not included by default. Ask Mojesu if an exception is possible.',
      'Quiet enjoyment for neighbours — no loud parties or commercial use without consent.',
      'Utilities (Yaka / NWSC) are typically paid by the tenant unless stated otherwise.',
    ],
  }
}

function residentialSaleRules(
  item: Property,
  titleStatus: Record<string, string>,
): ThingsColumn {
  const title = titleLabel(item, titleStatus)

  return {
    id: 'rules',
    title: 'Before you buy',
    items: [
      `Title status: ${title}`,
      'Independent title search recommended',
      'Offer subject to due diligence',
    ],
    details: [
      `Listed tenure: ${title}. Always verify current ownership and encumbrances with a lawyer or title search.`,
      'Mojesu arranges viewings and introductions; legal transfer is handled by your conveyancer.',
      'Offers are subject to survey, valuation, and clear title unless otherwise agreed in writing.',
      'Ask for available land/title documents before committing funds.',
    ],
  }
}

function commercialRentRules(item: Property): ThingsColumn {
  const deposit = item.depositMonths ?? 2
  const lease = item.leaseTerm ?? '1 year renewable'

  return {
    id: 'rules',
    title: 'Lease & use',
    items: [
      `${deposit}-month security deposit typical`,
      `Lease: ${lease}`,
      'Use must match permitted commercial purpose',
      'Fit-out changes need written approval',
    ],
    details: [
      `Typical security deposit: ${deposit} months. Confirm exact amount before signing.`,
      `Lease term: ${lease}. Renewal and break clauses are agreed in the lease.`,
      'Trading hours, signage, and fit-out must follow landlord and municipal rules.',
      'Subletting usually requires prior written consent.',
    ],
  }
}

function commercialSaleRules(
  item: Property,
  titleStatus: Record<string, string>,
): ThingsColumn {
  const title = titleLabel(item, titleStatus)

  return {
    id: 'rules',
    title: 'Before you buy',
    items: [
      `Title status: ${title}`,
      'Confirm zoning and permitted use',
      'Structural / MEP survey recommended',
    ],
    details: [
      `Listed tenure: ${title}. Engage a lawyer for title and company/ownership checks.`,
      'Verify zoning, trade licences, and any sitting tenant rights before completion.',
      'Request service charge, rates, and recent utility history where applicable.',
    ],
  }
}

function landRules(
  item: Property,
  titleStatus: Record<string, string>,
): ThingsColumn {
  const title = titleLabel(item, titleStatus)
  const surveyed = hasAmenity(item, 'surveyed')
  const clear = hasAmenity(item, 'title_clear')

  return {
    id: 'rules',
    title: 'Due diligence',
    items: [
      `Title status: ${title}`,
      surveyed ? 'Plot surveyed / beaconed' : 'Confirm beacons and boundaries on site',
      clear ? 'Clear title docs available to review' : 'Request title documents before offer',
      'Independent survey recommended',
    ],
    details: [
      `Listed tenure: ${title}. Never pay a deposit without verifying ownership.`,
      surveyed
        ? 'Listing notes that the plot is surveyed/beaconed — still walk the boundaries with a surveyor.'
        : 'Arrange a licensed surveyor to confirm size, beacons, and overlaps.',
      'Check road access, drainage, and neighbouring claims during a site visit.',
      'Mojesu can introduce you to trusted surveyors and lawyers on request.',
    ],
  }
}

function safetyColumn(item: Property): ThingsColumn {
  const items: string[] = []
  const details: string[] = []

  if (item.category === 'land') {
    items.push('Uneven ground and open site conditions')
    items.push('Wear closed shoes on site visits')
    if (hasAmenity(item, 'water_access')) {
      items.push('Water source or drainage nearby — mind footing')
    }
    if (!hasAmenity(item, 'fenced')) {
      items.push('Plot may not be fully fenced')
    }
    details.push(
      'Land viewings are outdoor site visits. Watch for uneven ground, excavations, and vegetation.',
      'Go with Mojesu or an authorised agent — do not enter locked or disputed land alone.',
      'Children should be supervised; sites are not playgrounds.',
    )
  } else if (item.useClass === 'commercial') {
    items.push('Confirm fire exits and extinguishers on visit')
    if (hasAmenity(item, 'loading_access')) {
      items.push('Loading / vehicle movement on site')
    }
    if (hasAmenity(item, 'elevator')) {
      items.push('Lift access — follow posted capacity limits')
    }
    items.push('Ask about CCTV and after-hours access')
    details.push(
      'Commercial units vary: stairs, loading bays, and plant rooms can present hazards.',
      'During viewings, follow the agent and do not enter restricted plant or roof areas alone.',
      'Verify insurance, fire compliance, and access control before occupying.',
    )
  } else {
    // residential
    if (hasAmenity(item, 'gated')) {
      items.push('Gated compound — follow visitor entry rules')
    }
    if (hasAmenity(item, 'balcony')) {
      items.push('Balcony / heights — supervise children')
    }
    if (hasAmenity(item, 'generator') || hasAmenity(item, 'solar')) {
      items.push('Backup power present — ask about safe operation')
    }
    if (hasAmenity(item, 'own_yaka') || hasAmenity(item, 'shared_yaka') || hasAmenity(item, 'umeme_prepaid')) {
      items.push('Prepaid / Yaka electricity — keep tokens topped up')
    }
    if (items.length < 3) {
      items.push('Standard home hazards — stairs, wet floors, kitchen heat')
    }
    if (items.length < 3) {
      items.push('Confirm locks, water shut-off, and emergency contacts at handover')
    }
    details.push(
      'Treat every viewing like a live home: watch stairs, wet bathrooms, and balcony edges.',
      item.verified
        ? 'This listing is Mojesu-verified. Still inspect locks, water, and power yourself before signing.'
        : 'Inspect locks, water pressure, and power before committing.',
      'Report safety concerns to Mojesu so we can flag them for other clients.',
    )
  }

  return {
    id: 'safety',
    title: 'Safety & property',
    items: items.slice(0, 4),
    details,
  }
}

function rulesFor(
  item: Property,
  titleStatus: Record<string, string>,
): ThingsColumn {
  if (item.category === 'land') return landRules(item, titleStatus)
  if (item.useClass === 'commercial') {
    return item.listingMode === 'rent'
      ? commercialRentRules(item)
      : commercialSaleRules(item, titleStatus)
  }
  return item.listingMode === 'rent'
    ? residentialRentRules(item)
    : residentialSaleRules(item, titleStatus)
}

/** Build the three Airbnb-style columns for a listing. */
export function getThingsToKnow(
  item: Property,
  opts: ThingsToKnowOpts = {},
): ThingsColumn[] {
  const titleStatus = opts.titleStatus ?? DEFAULT_TAXONOMY.titleStatus
  return [
    viewingPolicy(item, opts),
    rulesFor(item, titleStatus),
    safetyColumn(item),
  ]
}
