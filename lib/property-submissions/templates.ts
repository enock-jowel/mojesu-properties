import {
  CATEGORY_LABEL,
  LISTING_MODE_LABEL,
  type PropertySubmissionRequest,
} from './types'

function formatPrice(req: PropertySubmissionRequest): string {
  if (req.priceNotSure || req.askingPrice == null) return 'Not sure yet'
  return `UGX ${req.askingPrice.toLocaleString('en-US')}`
}

function categoryLine(req: PropertySubmissionRequest): string {
  if (req.category === 'house') {
    const beds =
      req.bedrooms != null ? `${req.bedrooms} bed` : 'beds n/a'
    const baths =
      req.bathrooms != null ? `${req.bathrooms} bath` : 'baths n/a'
    return `${beds}, ${baths}`
  }
  if (req.category === 'land') {
    return req.approxPlotSize?.trim() || 'Plot size n/a'
  }
  return req.approxFloorArea?.trim() || 'Floor area n/a'
}

export function buildEmailSubject(req: PropertySubmissionRequest): string {
  const type = CATEGORY_LABEL[req.category]
  const mode = LISTING_MODE_LABEL[req.listingMode]
  return `New Property Submission — ${req.contactName} (${type}, ${mode})`
}

/** HTML email body for the business manager. */
export function buildEmailHtml(req: PropertySubmissionRequest): string {
  const type = CATEGORY_LABEL[req.category]
  const mode = LISTING_MODE_LABEL[req.listingMode]
  const photoCount = req.photos?.length ?? 0

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#2a2e32;line-height:1.5">
  <h2 style="margin:0 0 16px">New Property Submission</h2>
  <p style="margin:0 0 8px"><strong>Owner:</strong> ${escapeHtml(req.contactName)}</p>
  <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(req.contactPhone)}</p>
  <p style="margin:0 0 8px"><strong>Best time to reach:</strong> ${escapeHtml(req.bestTimeToReach)}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
  <p style="margin:0 0 8px"><strong>Listing for:</strong> ${escapeHtml(mode)}</p>
  <p style="margin:0 0 8px"><strong>Property type:</strong> ${escapeHtml(type)}</p>
  <p style="margin:0 0 8px"><strong>Area:</strong> ${escapeHtml(req.location)}</p>
  <p style="margin:0 0 8px"><strong>Rough address:</strong> ${escapeHtml(req.roughAddress)}</p>
  <p style="margin:0 0 8px"><strong>Details:</strong> ${escapeHtml(categoryLine(req))}</p>
  <p style="margin:0 0 8px"><strong>Asking price:</strong> ${escapeHtml(formatPrice(req))}</p>
  <p style="margin:0 0 8px"><strong>Photos attached:</strong> ${photoCount}</p>
  <p style="margin:16px 0 0;padding:12px 14px;background:#f1f7fb;border-radius:8px">
    Intake only — verify, photograph, and create the live listing manually. No public listing was auto-created.
  </p>
</body>
</html>`
}

/** Plain-text WhatsApp body for wa.me pre-fill (no HTML). */
export function buildWhatsAppMessage(req: PropertySubmissionRequest): string {
  const type = CATEGORY_LABEL[req.category]
  const mode = LISTING_MODE_LABEL[req.listingMode]
  const photoCount = req.photos?.length ?? 0

  return [
    '🏠 New Property Submission',
    '',
    `Owner: ${req.contactName}`,
    `Phone: ${req.contactPhone}`,
    `Best time: ${req.bestTimeToReach}`,
    '',
    `For: ${mode}`,
    `Type: ${type}`,
    `Area: ${req.location}`,
    `Address: ${req.roughAddress}`,
    `Details: ${categoryLine(req)}`,
    `Asking price: ${formatPrice(req)}`,
    `Photos: ${photoCount}`,
    '',
    'Intake only — arrange visit & verify before listing.',
  ].join('\n')
}

export function buildWhatsAppUrl(
  notifyNumber: string,
  message: string,
): string {
  const digits = notifyNumber.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
