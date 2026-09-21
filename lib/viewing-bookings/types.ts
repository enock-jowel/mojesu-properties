/**
 * Viewing booking — types & constants.
 * DB log only for now (no admin UI).
 * Notifications: email (server) + WhatsApp via client-side wa.me link only.
 */

export const VIEWING_FEE_UGX = 70_000
/** How many listings one viewing pass covers */
export const VIEWING_PASS_PROPERTIES = 10
/** Validity window of a viewing pass (days) */
export const VIEWING_PASS_DAYS = 14

export function formatViewingPassBlurb(
  amountOrConfig?:
    | number
    | { feeUgx?: number; passProperties?: number; passDays?: number },
): string {
  let feeUgx = VIEWING_FEE_UGX
  let passProperties = VIEWING_PASS_PROPERTIES
  let passDays = VIEWING_PASS_DAYS

  if (typeof amountOrConfig === 'number') {
    feeUgx = amountOrConfig
  } else if (amountOrConfig && typeof amountOrConfig === 'object') {
    feeUgx = amountOrConfig.feeUgx ?? feeUgx
    passProperties = amountOrConfig.passProperties ?? passProperties
    passDays = amountOrConfig.passDays ?? passDays
  }

  return `UGX ${feeUgx.toLocaleString('en-US')} for ${passProperties} property viewings — valid for ${passDays} days`
}

export type ViewingBookingStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'expired'
  | 'declined'

export interface ViewingBooking {
  id: string
  listingIds: string[]
  preferredDate: string
  preferredTime?: string
  contactName: string
  contactPhone: string
  contactEmail: string
  status: ViewingBookingStatus
  requestedAt: string
  confirmedAt?: string | null
  expiresAt?: string | null
}

export interface ViewingBookingPropertyRef {
  id: string
  slug: string
  title: string
  /** Absolute URL to the live listing page */
  url: string
  /** Prefer short link when a shortener is configured */
  shortUrl: string
}

export interface ViewingBookingRequest {
  listingIds: string[]
  preferredDate: string
  /** Optional time slot from the UI */
  preferredTime?: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export interface ViewingBookingSubmitResult {
  ok: boolean
  bookingId?: string
  emailSent?: boolean
  /**
   * wa.me deep link for the business manager — client-side only.
   * No server-side WhatsApp API; manager opens and sends manually.
   */
  whatsappUrl?: string | null
  error?: string
}

export interface NotifyEnv {
  SITE_URL: string
  NOTIFY_EMAIL_TO: string
  NOTIFY_EMAIL_FROM?: string
  RESEND_API_KEY?: string
  /**
   * Digits-only WhatsApp number for wa.me links (country code, no +).
   * Prefer NEXT_PUBLIC_WHATSAPP_NUMBER so the confirmation CTA works client-side.
   */
  WHATSAPP_NUMBER: string
  BITLY_ACCESS_TOKEN?: string
}
