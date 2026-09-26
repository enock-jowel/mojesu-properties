import {
  VIEWING_FEE_UGX,
  type ViewingBookingPropertyRef,
  type ViewingBookingRequest,
} from './types'
import {
  brandedEmail,
  button,
  detailTable,
  escapeHtml,
  noteBox,
  plainText,
  propertyCard,
  sectionTitle,
  waLink,
  type DetailRow,
} from '@/lib/email/brand'

export function formatPreferredDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatFeeUgx(amount: number = VIEWING_FEE_UGX): string {
  return `UGX ${amount.toLocaleString('en-US')}`
}

export function buildEmailSubject(
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
): string {
  const dateLabel = formatPreferredDate(req.preferredDate)
  return `New Viewing Booking Request — ${req.contactName} (${properties.length} ${
    properties.length === 1 ? 'property' : 'properties'
  }, ${dateLabel})`
}

function bookingRows(req: ViewingBookingRequest): DetailRow[] {
  const email = req.contactEmail?.trim()
  return [
    { label: 'Client', value: req.contactName },
    { label: 'Phone', value: req.contactPhone, href: `tel:${req.contactPhone.replace(/\s/g, '')}` },
    ...(email ? [{ label: 'Email', value: email, href: `mailto:${email}` }] : []),
    { label: 'Preferred date', value: formatPreferredDate(req.preferredDate) },
    ...(req.preferredTime ? [{ label: 'Preferred time', value: req.preferredTime }] : []),
  ]
}

/** Branded HTML email body for the business manager. */
export function buildEmailHtml(
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
  feeUgx: number = VIEWING_FEE_UGX,
  siteUrl?: string,
): string {
  const dateLabel = formatPreferredDate(req.preferredDate)
  const when = `${dateLabel}${req.preferredTime ? ` · ${req.preferredTime}` : ''}`
  const wa = waLink(
    req.contactPhone,
    `Hi ${req.contactName}, this is Mojesu Properties about your viewing request for ${when}.`,
  )
  const email = req.contactEmail?.trim()

  const body = [
    detailTable(bookingRows(req)),
    `<p style="margin:20px 0 0">${[
      wa ? button('Reply on WhatsApp', wa, 'whatsapp') : '',
      button('Call client', `tel:${req.contactPhone.replace(/\s/g, '')}`, 'outline'),
      email ? button('Email client', `mailto:${email}`, 'outline') : '',
    ].join('')}</p>`,
    sectionTitle(
      `${properties.length === 1 ? 'Property' : `Properties (${properties.length})`} to view`,
    ),
    properties.map((p) => propertyCard(p)).join(''),
    noteBox(
      `<strong>Viewing pass:</strong> ${escapeHtml(formatFeeUgx(feeUgx))} via MoMo or cash — pending confirmation.`,
    ),
  ].join('')

  return brandedEmail({
    siteUrl,
    preheader: `${req.contactName} wants to view ${properties.length === 1 ? properties[0].title : `${properties.length} properties`} on ${when}`,
    eyebrow: 'Viewing request',
    title: `${req.contactName} wants to book a viewing`,
    intro: `Requested for ${when}. The client may follow up on WhatsApp to confirm.`,
    body,
  })
}

export function buildEmailText(
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
  feeUgx: number = VIEWING_FEE_UGX,
): string {
  return plainText('New viewing request', bookingRows(req), [
    `Properties (${properties.length}):`,
    ...properties.map(
      (p, i) =>
        `${i + 1}. ${p.title}${p.priceLabel ? ` — ${p.priceLabel}` : ''}\n   ${p.url}`,
    ),
    '',
    `Viewing pass: ${formatFeeUgx(feeUgx)} (MoMo or cash) — pending confirmation.`,
  ])
}

/** Plain-text WhatsApp body for wa.me pre-fill (no HTML). */
export function buildWhatsAppMessage(
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
  feeUgx: number = VIEWING_FEE_UGX,
): string {
  const dateLabel = formatPreferredDate(req.preferredDate)
  const timeBit = req.preferredTime ? ` at ${req.preferredTime}` : ''
  const lines = properties.map(
    (p, i) => `${i + 1}. ${p.title} - ${p.shortUrl || p.url}`,
  )

  return [
    '🏠 New Viewing Booking Request',
    '',
    `Client: ${req.contactName}`,
    `Phone: ${req.contactPhone}`,
    `Preferred date: ${dateLabel}${timeBit}`,
    '',
    `Properties (${properties.length}):`,
    ...lines,
    '',
    `Payment: ${formatFeeUgx(feeUgx)} (MoMo or cash) - pending confirmation`,
  ].join('\n')
}

/**
 * Client-side WhatsApp only — opens WhatsApp with a pre-filled message.
 * Digits-only number (country code, no +).
 */
export function buildWhatsAppUrl(notifyNumber: string, message: string): string {
  const digits = notifyNumber.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** @deprecated Use buildWhatsAppUrl */
export const buildWhatsAppFallbackUrl = buildWhatsAppUrl
