import {
  VIEWING_FEE_UGX,
  type ViewingBookingPropertyRef,
  type ViewingBookingRequest,
} from './types'

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

/** HTML email body for the business manager. */
export function buildEmailHtml(
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
  feeUgx: number = VIEWING_FEE_UGX,
): string {
  const dateLabel = formatPreferredDate(req.preferredDate)
  const timeLine = req.preferredTime
    ? `<p style="margin:0 0 8px"><strong>Preferred time:</strong> ${escapeHtml(req.preferredTime)}</p>`
    : ''

  const listItems = properties
    .map(
      (p, i) =>
        `<li style="margin:0 0 8px">${i + 1}. <a href="${escapeAttr(p.url)}">${escapeHtml(p.title)}</a></li>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#2a2e32;line-height:1.5">
  <h2 style="margin:0 0 16px">New Viewing Booking Request</h2>
  <p style="margin:0 0 8px"><strong>Client:</strong> ${escapeHtml(req.contactName)}</p>
  <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(req.contactPhone)}</p>
  ${
    req.contactEmail?.trim()
      ? `<p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(req.contactEmail)}</p>`
      : ''
  }
  <p style="margin:0 0 8px"><strong>Preferred date:</strong> ${escapeHtml(dateLabel)}</p>
  ${timeLine}
  <p style="margin:16px 0 8px"><strong>Properties (${properties.length}):</strong></p>
  <ol style="margin:0 0 16px;padding-left:20px">${listItems}</ol>
  <p style="margin:0;padding:12px 14px;background:#f1f7fb;border-radius:8px">
    <strong>Payment reminder:</strong> ${formatFeeUgx(feeUgx)} via MoMo or cash — pending confirmation.
  </p>
</body>
</html>`
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;')
}
