/**
 * Property submission (List With Us) — lead intake only.
 * Does NOT create a public listing. Team verifies, photographs, and lists manually.
 */

export type ListingMode = 'rent' | 'sale'
export type PropertyCategory = 'house' | 'land' | 'commercial'
export type BestTimeToReach = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime'
export type PropertySubmissionStatus =
  | 'new'
  | 'contacted'
  | 'visited'
  | 'listed'
  | 'declined'

export const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  house: 'House/Apartment',
  land: 'Land',
  commercial: 'Commercial',
}

export const LISTING_MODE_LABEL: Record<ListingMode, string> = {
  rent: 'Rent',
  sale: 'Sell',
}

export interface PropertySubmission {
  id: string
  listingMode: ListingMode
  category: PropertyCategory
  /** Area/town from tiered catalog (or free text) */
  location: string
  roughAddress: string
  bedrooms?: number | null
  bathrooms?: number | null
  approxPlotSize?: string | null
  approxFloorArea?: string | null
  /** Optional photo data URLs or remote URLs — may be empty */
  photos: string[]
  /** Null when owner chose "not sure yet" */
  askingPrice?: number | null
  contactName: string
  contactPhone: string
  bestTimeToReach: BestTimeToReach
  status: PropertySubmissionStatus
  submittedAt: string
}

export interface PropertySubmissionRequest {
  listingMode: ListingMode
  category: PropertyCategory
  location: string
  roughAddress: string
  bedrooms?: number | null
  bathrooms?: number | null
  approxPlotSize?: string | null
  approxFloorArea?: string | null
  photos?: string[]
  askingPrice?: number | null
  priceNotSure?: boolean
  contactName: string
  contactPhone: string
  bestTimeToReach: BestTimeToReach
}

export interface PropertySubmissionSubmitResult {
  ok: boolean
  submissionId?: string
  emailSent?: boolean
  /** wa.me deep link for the business manager — client-side only */
  whatsappUrl?: string | null
  error?: string
}
