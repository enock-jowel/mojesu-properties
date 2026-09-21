'use client'

import type {
  ViewingBookingRequest,
  ViewingBookingSubmitResult,
} from '@/lib/viewing-bookings/types'
import type { Property } from '@/lib/properties'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/viewing-bookings/templates'

const PUBLIC_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  process.env.NEXT_PUBLIC_NOTIFY_WHATSAPP_NUMBER ||
  '256780827159'

const API_URL =
  process.env.NEXT_PUBLIC_BOOKINGS_API_URL ?? '/api/viewing-bookings'

function siteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
}

function toRefs(properties: Property[]) {
  const origin = siteOrigin()
  return properties.map((p) => {
    const url = `${origin}/listings/${p.slug}/`
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      url,
      shortUrl: url,
    }
  })
}

function withWhatsAppUrl(
  result: ViewingBookingSubmitResult,
  req: ViewingBookingRequest,
  properties: Property[],
  feeUgx?: number,
): ViewingBookingSubmitResult {
  if (result.whatsappUrl || !PUBLIC_WHATSAPP_NUMBER) return result
  return {
    ...result,
    whatsappUrl: buildWhatsAppUrl(
      PUBLIC_WHATSAPP_NUMBER,
      buildWhatsAppMessage(req, toRefs(properties), feeUgx),
    ),
  }
}

/**
 * Submit a viewing booking.
 * On API failure returns ok:false (still attaches wa.me so the user can message).
 * Does not pretend the booking was saved.
 */
export async function submitViewingBookingClient(
  req: ViewingBookingRequest,
  properties: Property[],
  feeUgx?: number,
): Promise<ViewingBookingSubmitResult> {
  const whatsappUrl = PUBLIC_WHATSAPP_NUMBER
    ? buildWhatsAppUrl(
        PUBLIC_WHATSAPP_NUMBER,
        buildWhatsAppMessage(req, toRefs(properties), feeUgx),
      )
    : null

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })

    if (!res.ok) {
      console.warn('[booking] API error', res.status)
      return {
        ok: false,
        error: `Booking request failed (${res.status})`,
        emailSent: false,
        whatsappUrl,
      }
    }

    const data = (await res.json()) as ViewingBookingSubmitResult
    return withWhatsAppUrl(data, req, properties, feeUgx)
  } catch (err) {
    console.warn('[booking] API unreachable', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
      emailSent: false,
      whatsappUrl,
    }
  }
}
