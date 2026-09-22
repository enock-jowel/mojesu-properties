/**
 * Defaults for taxonomy / areas / viewing / forms / nav.
 * Seeded into site_content; used as fallback when DB is empty.
 */
import { AMENITY_CATALOG } from '@/lib/amenities'
import { AREA_CATALOG, AREA_TIER_LABEL } from '@/lib/areas'
import {
  COMMERCIAL_TYPE_OPTIONS,
  INDUSTRIAL_TYPE_OPTIONS,
  LAND_TYPE_OPTIONS,
  MIXED_USE_TYPE_OPTIONS,
  RESIDENTIAL_TYPE_OPTIONS,
} from '@/lib/listing-kinds'
import {
  COMMERCIAL_KIND_LABEL,
  RESIDENTIAL_KIND_LABEL,
  TITLE_STATUS_LABEL,
} from '@/lib/properties'
import {
  CATEGORY_LABEL,
  LISTING_MODE_LABEL,
} from '@/lib/property-submissions/types'
import {
  VIEWING_FEE_UGX,
  VIEWING_PASS_DAYS,
  VIEWING_PASS_PROPERTIES,
} from '@/lib/viewing-bookings/types'
import type {
  AreasContent,
  FormsContent,
  NavContent,
  TaxonomyContent,
  ViewingContent,
} from '@/lib/site-content/catalog-types'

const amenityLabels: Record<string, string> = {}
for (const [key, def] of Object.entries(AMENITY_CATALOG)) {
  amenityLabels[key] = def.label
}

/** Labels in KIND maps that are not in hero filter option lists */
function extrasFrom(
  full: Record<string, string>,
  options: { value: string; label: string }[],
): Record<string, string> {
  const inOptions = new Set(options.map((o) => o.value))
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(full)) {
    if (!inOptions.has(k)) out[k] = v
  }
  return out
}

export const DEFAULT_TAXONOMY: TaxonomyContent = {
  amenityLabels,
  titleStatus: { ...TITLE_STATUS_LABEL },
  residential: RESIDENTIAL_TYPE_OPTIONS.map((o) => ({ ...o })),
  land: LAND_TYPE_OPTIONS.map((o) => ({ ...o })),
  commercial: COMMERCIAL_TYPE_OPTIONS.map((o) => ({ ...o })),
  industrial: INDUSTRIAL_TYPE_OPTIONS.map((o) => ({ ...o })),
  mixedUse: MIXED_USE_TYPE_OPTIONS.map((o) => ({ ...o })),
  residentialExtras: extrasFrom(RESIDENTIAL_KIND_LABEL, RESIDENTIAL_TYPE_OPTIONS),
  commercialExtras: extrasFrom(COMMERCIAL_KIND_LABEL, COMMERCIAL_TYPE_OPTIONS),
  intakeCategory: { ...CATEGORY_LABEL },
  intakeMode: { ...LISTING_MODE_LABEL },
  heroMainTabs: { rent: 'Rent', buy: 'Buy', land: 'Land' },
  heroSubTabs: {
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
    'mixed-use': 'Mixed-use',
    allLand: 'All land',
  },
}

export const DEFAULT_AREAS: AreasContent = {
  tierLabels: { ...AREA_TIER_LABEL },
  catalog: AREA_CATALOG.map((a) => ({ ...a })),
  tierBlurbs: {
    prime: 'Kololo, Nakasero, Muyenga & more',
    mid: 'Ntinda, Kira, Najjera, Naalya…',
    emerging: 'Wakiso, Mukono, Outer Kira…',
  },
  midMarketRentalAreas: ['Ntinda', 'Kira', 'Najjera', 'Naalya', 'Bukoto'],
  areaSearchPlaceholder: 'Search area or town…',
}

export const DEFAULT_VIEWING: ViewingContent = {
  feeUgx: VIEWING_FEE_UGX,
  passProperties: VIEWING_PASS_PROPERTIES,
  passDays: VIEWING_PASS_DAYS,
  paymentNote: 'MoMo or cash — pending confirmation.',
  confirmTitle: 'Viewing request received',
  confirmSubtitle: 'Mojesu will confirm shortly',
}

export const DEFAULT_FORMS: FormsContent = {
  contact: {
    idleTitle: 'Send us a message',
    idleBody:
      'Tell us what you’re looking for — we’ll follow up by email or phone within one business day.',
    idleCta: 'Get in touch',
    successTitle: 'Message sent',
    successBody: 'We’ll contact you by email or phone within one business day.',
    successAgain: 'Send another message',
    toastSuccess:
      'Message sent. Mojesu will reach out within one business day.',
    steps: {
      step1: 'How can we help?',
      step2: 'Your details',
      step3: 'Confirm message',
    },
    purposes: [
      'Buy a home',
      'Rent a home',
      'Buy land',
      'List a property',
      'Services',
      'General question',
    ],
    listPropertyPurpose: 'List a property',
    labelPurpose: 'I want to',
    labelArea: 'Preferred area',
    labelMessage: 'Message',
    placeholderArea: 'e.g. Ntinda, Kampala',
    placeholderMessage: 'Tell us briefly what you need…',
    placeholderName: 'Full name',
    placeholderEmail: 'Email',
    placeholderPhone: 'Phone number',
    continueLabel: 'Continue',
    confirmLabel: 'Confirm & send',
    sendingLabel: 'Sending…',
    errors: {
      purpose: 'Choose what you need help with',
      area: 'Enter a preferred area',
      message: 'Add a short message (at least a sentence)',
      name: 'Enter your full name',
      email: 'Enter a valid email',
      phone: 'Enter a valid phone number',
    },
  },
  listWithUs: {
    steps: {
      step1: 'What are you listing?',
      step2: 'Your details',
      step3: 'Confirm request',
    },
    idleBullets: [
      'We reply within 24–48 hours',
      'Professional photos on the visit',
      'Nothing goes live until we verify',
    ],
    bestTimes: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
    labels: {
      listingType: 'Listing type',
      propertyType: 'Property type',
      area: 'Area / town',
      address: 'Rough address',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      plotSize: 'Approximate plot size',
      floorArea: 'Approximate floor area',
      askingPrice: 'Asking price (UGX)',
      photos: 'Photos (optional)',
      bestTime: 'Best time to reach',
    },
    placeholders: {
      address: 'Street, landmark, or estate…',
      bedrooms: 'e.g. 3',
      bathrooms: 'e.g. 2',
      plotSize: 'e.g. 50x100',
      floorArea: 'e.g. 120 sqm',
      askingPrice: 'Approximate is fine',
      name: 'Full name',
      phone: 'Phone / WhatsApp',
    },
    confirmTitle: 'Request received',
    confirmSubtitle: 'Visit arrangement coming soon',
    confirmBody:
      'Our team will contact you within 24–48 hours to arrange a visit and verify your property.',
    confirmNote:
      'This is a service request — Mojesu will photograph and create the listing after the visit. Nothing goes live automatically.',
    whatsappCta: 'Confirm on WhatsApp',
    doneLabel: 'Done',
    errors: {
      mode: 'Choose rent or sell',
      category: 'Choose a property type',
      area: 'Enter an area or town',
      address: 'Add a rough address or landmark',
      price: 'Enter a price or mark not sure yet',
      name: 'Enter your full name',
      phone: 'Enter a valid phone number',
    },
  },
  viewing: {
    steps: {
      step1: 'When works for you?',
      step2: 'Your details',
      step3: 'Confirm booking',
    },
    timeSlots: [
      '9:00 AM',
      '10:30 AM',
      '12:00 PM',
      '2:00 PM',
      '3:30 PM',
      '5:00 PM',
    ],
    idleTitle: 'Book a viewing',
    idleCta: 'Book a viewing',
    confirmBooking: 'Confirm booking',
    sendingLabel: 'Sending…',
    placeholders: {
      name: 'Full name',
      phone: 'Phone / WhatsApp',
      email: 'Email',
    },
    errors: {
      date: 'Choose a preferred date',
      time: 'Choose a time slot',
      name: 'Enter your full name',
      phone: 'Enter a valid phone number',
      email: 'Enter a valid email',
    },
  },
}

export const DEFAULT_NAV: NavContent = {
  header: [
    { label: 'Rent', href: '/rent/' },
    { label: 'Buy', href: '/buy/' },
    { label: 'Areas', href: '/areas/' },
    { label: 'About', href: '/about/' },
    { label: 'Services', href: '/services/' },
    { label: 'Contact', href: '/#contact' },
  ],
  headerCta: { label: 'List your home', href: '/list-with-us/' },
  footerMenuTitle: 'Menu',
  footerCompanyTitle: 'Company',
  footerContactTitle: 'Contact us',
  footerMenu: [
    { label: 'Home', href: '/' },
    { label: 'Rent', href: '/rent/' },
    { label: 'Buy', href: '/buy/' },
    { label: 'Land', href: '/land/' },
    { label: 'Areas', href: '/areas/' },
    { label: 'Services', href: '/services/' },
  ],
  footerCompany: [
    { label: 'About', href: '/about/' },
    { label: 'Agents', href: '/about/#agents' },
    { label: 'Insights', href: '/#blog' },
    { label: 'Contact', href: '/#contact' },
    { label: 'List a property', href: '/list-with-us/' },
  ],
  legalName: 'Mojesu Properties International Ltd',
}
