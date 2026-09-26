import {
  CATEGORY_LABEL,
  LISTING_MODE_LABEL,
  type PropertySubmissionRequest,
} from './types'
import {
  brandedEmail,
  button,
  detailTable,
  escapeHtml,
  noteBox,
  photoGrid,
  plainText,
  sectionTitle,
  waLink,
  type DetailRow,
} from '@/lib/email/brand'

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

function ownerRows(req: PropertySubmissionRequest): DetailRow[] {
  return [
    { label: 'Owner', value: req.contactName },
    { label: 'Phone', value: req.contactPhone, href: `tel:${req.contactPhone.replace(/\s/g, '')}` },
    { label: 'Best time to reach', value: req.bestTimeToReach },
  ]
}

function propertyRows(req: PropertySubmissionRequest): DetailRow[] {
  return [
    { label: 'Listing for', value: LISTING_MODE_LABEL[req.listingMode] },
    { label: 'Property type', value: CATEGORY_LABEL[req.category] },
    { label: 'Area', value: req.location },
    { label: 'Rough address', value: req.roughAddress },
    { label: 'Details', value: categoryLine(req) },
    { label: 'Asking price', value: formatPrice(req) },
  ]
}

/** Only hosted https photos can render in an email. */
function hostedPhotos(req: PropertySubmissionRequest): string[] {
  return (req.photos ?? []).filter((p) => /^https:\/\//i.test(p))
}

/** Branded HTML email body for the business manager. */
export function buildEmailHtml(
  req: PropertySubmissionRequest,
  siteUrl?: string,
): string {
  const type = CATEGORY_LABEL[req.category]
  const mode = LISTING_MODE_LABEL[req.listingMode]
  const photos = hostedPhotos(req)
  const wa = waLink(
    req.contactPhone,
    `Hi ${req.contactName}, this is Mojesu Properties about the ${type.toLowerCase()} in ${req.location} you submitted.`,
  )

  const body = [
    photos[0]
      ? `<a href="${escapeHtml(photos[0])}"><img src="${escapeHtml(photos[0])}" width="536" alt="Submitted property photo" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:16px;margin:0 0 8px" /></a>`
      : '',
    sectionTitle('Owner'),
    detailTable(ownerRows(req)),
    `<p style="margin:20px 0 0">${[
      wa ? button('Reply on WhatsApp', wa, 'whatsapp') : '',
      button('Call owner', `tel:${req.contactPhone.replace(/\s/g, '')}`, 'outline'),
    ].join('')}</p>`,
    sectionTitle('Property'),
    detailTable(propertyRows(req)),
    photos.length > 1
      ? `${sectionTitle(`All photos (${photos.length})`)}${photoGrid(photos)}`
      : photos.length === 0
        ? noteBox('No photos were uploaded with this submission.')
        : '',
    noteBox(
      'Intake only — verify, photograph and create the live listing manually. No public listing was created automatically.',
    ),
  ].join('')

  return brandedEmail({
    siteUrl,
    preheader: `${req.contactName} wants to ${mode.toLowerCase()} a ${type.toLowerCase()} in ${req.location} — ${formatPrice(req)}`,
    eyebrow: 'List with us',
    title: `New ${type.toLowerCase()} to ${mode.toLowerCase()} in ${req.location}`,
    intro: `${req.contactName} submitted a property through the website.`,
    body,
  })
}

export function buildEmailText(req: PropertySubmissionRequest): string {
  const photos = hostedPhotos(req)
  return plainText(
    'New property submission',
    [...ownerRows(req), ...propertyRows(req)],
    [
      photos.length ? `Photos (${photos.length}):\n${photos.join('\n')}` : 'No photos uploaded.',
      '',
      'Intake only — verify before listing.',
    ],
  )
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