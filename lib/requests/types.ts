export type ViewingBookingStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'expired'
  | 'declined'

export type PropertySubmissionStatus =
  | 'new'
  | 'contacted'
  | 'visited'
  | 'listed'
  | 'declined'

export type ViewingBookingRow = {
  id: string
  listing_ids: string[]
  preferred_date: string | null
  preferred_time: string | null
  contact_name: string
  contact_phone: string
  contact_email: string | null
  status: ViewingBookingStatus
  confirmed_at: string | null
  expires_at: string | null
  requested_at: string
}

export type PropertySubmissionRow = {
  id: string
  listing_mode: 'rent' | 'sale' | null
  category: string | null
  area: string | null
  rough_address: string | null
  bedrooms: number | null
  bathrooms: number | null
  approx_plot_size: string | null
  approx_floor_area: number | null
  photo_urls: string[] | null
  asking_price: number | null
  contact_name: string
  contact_phone: string
  best_time_to_reach: string | null
  status: PropertySubmissionStatus
  submitted_at: string
}

export type ListingAdminRef = {
  id: string
  slug: string
  title: string
  status: string
}

export const BOOKING_STATUS_LABEL: Record<ViewingBookingStatus, string> = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  completed: 'Completed',
  expired: 'Expired',
  declined: 'Declined',
}

export const SUBMISSION_STATUS_LABEL: Record<PropertySubmissionStatus, string> =
  {
    new: 'New',
    contacted: 'Contacted',
    visited: 'Visited',
    listed: 'Listed',
    declined: 'Declined',
  }

/** Pill soft classes aligned with CMS brief. */
export const BOOKING_STATUS_PILL: Record<ViewingBookingStatus, string> = {
  requested: 'bg-pill-soft text-secondary',
  confirmed: 'bg-pill-soft-mid text-ink',
  completed: 'bg-pill-soft-cool text-accent-deep',
  expired: 'bg-pill-soft-mid text-neutral-muted',
  declined: 'bg-pill-soft text-neutral-muted',
}

export const SUBMISSION_STATUS_PILL: Record<PropertySubmissionStatus, string> = {
  new: 'bg-pill-soft text-secondary',
  contacted: 'bg-pill-soft-mid text-ink',
  visited: 'bg-pill-soft-mid text-ink',
  listed: 'bg-pill-soft-cool text-accent-deep',
  declined: 'bg-pill-soft text-neutral-muted',
}
