import type { AreaTier } from '@/lib/areas'

export type LabelOption = { value: string; label: string }

/** Amenity labels, property kinds, title status, intake chips, hero tabs. */
export type TaxonomyContent = {
  amenityLabels: Record<string, string>
  titleStatus: Record<string, string>
  residential: LabelOption[]
  land: LabelOption[]
  commercial: LabelOption[]
  industrial: LabelOption[]
  mixedUse: LabelOption[]
  /** Legacy / extra residential labels not in filter options */
  residentialExtras: Record<string, string>
  commercialExtras: Record<string, string>
  intakeCategory: Record<string, string>
  intakeMode: Record<string, string>
  heroMainTabs: { rent: string; buy: string; land: string }
  heroSubTabs: {
    residential: string
    commercial: string
    industrial: string
    'mixed-use': string
    allLand: string
  }
}

export type AreasContent = {
  tierLabels: Record<AreaTier, string>
  catalog: { name: string; tier: AreaTier }[]
  tierBlurbs: Record<AreaTier, string>
  midMarketRentalAreas: string[]
  areaSearchPlaceholder: string
}

export type ViewingContent = {
  feeUgx: number
  passProperties: number
  passDays: number
  /** Short suffix after the fee blurb on cards */
  paymentNote: string
  /** Confirmation modal subtitle */
  confirmSubtitle: string
  confirmTitle: string
}

export type FormStepTitles = {
  step1: string
  step2: string
  step3: string
}

export type ContactFormCopy = {
  idleTitle: string
  idleBody: string
  idleCta: string
  successTitle: string
  successBody: string
  successAgain: string
  toastSuccess: string
  steps: FormStepTitles
  purposes: string[]
  listPropertyPurpose: string
  labelPurpose: string
  labelArea: string
  labelMessage: string
  placeholderArea: string
  placeholderMessage: string
  placeholderName: string
  placeholderEmail: string
  placeholderPhone: string
  continueLabel: string
  confirmLabel: string
  sendingLabel: string
  errors: {
    purpose: string
    area: string
    message: string
    name: string
    email: string
    phone: string
  }
}

export type ListWithUsFormCopy = {
  steps: FormStepTitles
  idleBullets: string[]
  bestTimes: string[]
  labels: {
    listingType: string
    propertyType: string
    area: string
    address: string
    bedrooms: string
    bathrooms: string
    plotSize: string
    floorArea: string
    askingPrice: string
    photos: string
    bestTime: string
  }
  placeholders: {
    address: string
    bedrooms: string
    bathrooms: string
    plotSize: string
    floorArea: string
    askingPrice: string
    name: string
    phone: string
  }
  confirmTitle: string
  confirmSubtitle: string
  confirmBody: string
  confirmNote: string
  whatsappCta: string
  doneLabel: string
  errors: {
    mode: string
    category: string
    area: string
    address: string
    price: string
    name: string
    phone: string
  }
}

export type ViewingFormCopy = {
  steps: FormStepTitles
  timeSlots: string[]
  idleTitle: string
  idleCta: string
  confirmBooking: string
  sendingLabel: string
  placeholders: {
    name: string
    phone: string
    email: string
  }
  errors: {
    date: string
    time: string
    name: string
    phone: string
    email: string
  }
}

export type FormsContent = {
  contact: ContactFormCopy
  listWithUs: ListWithUsFormCopy
  viewing: ViewingFormCopy
}

export type NavLink = { label: string; href: string }

export type NavContent = {
  header: NavLink[]
  headerCta: NavLink
  footerMenuTitle: string
  footerCompanyTitle: string
  footerContactTitle: string
  footerMenu: NavLink[]
  footerCompany: NavLink[]
  legalName: string
}

export type SiteCatalog = {
  taxonomy: TaxonomyContent
  areas: AreasContent
  viewing: ViewingContent
  forms: FormsContent
  nav: NavContent
}
