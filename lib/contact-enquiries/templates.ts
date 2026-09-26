import type { ContactEnquiryRequest } from './types'
import {
  brandedEmail,
  button,
  detailTable,
  messageBlock,
  plainText,
  sectionTitle,
  siteBase,
  waLink,
  type DetailRow,
} from '@/lib/email/brand'

export function buildEmailSubject(req: ContactEnquiryRequest): string {
  return `New contact enquiry — ${req.name} (${req.purpose})`
}

function rows(req: ContactEnquiryRequest, siteUrl?: string): DetailRow[] {
  return [
    { label: 'Name', value: req.name },
    { label: 'Email', value: req.email, href: `mailto:${req.email}` },
    { label: 'Phone', value: req.phone, href: `tel:${req.phone.replace(/\s/g, '')}` },
    { label: 'Looking to', value: req.purpose },
    { label: 'Area', value: req.location },
    ...(req.sourcePath
      ? [{ label: 'Sent from', value: req.sourcePath, href: `${siteBase(siteUrl)}${req.sourcePath}` }]
      : []),
  ]
}

export function buildEmailHtml(req: ContactEnquiryRequest, siteUrl?: string): string {
  const wa = waLink(req.phone, `Hi ${req.name}, this is Mojesu Properties replying to your enquiry.`)
  const body = [
    detailTable(rows(req, siteUrl)),
    `<p style="margin:20px 0 0">${[
      button('Reply by email', `mailto:${req.email}`),
      wa ? button('WhatsApp', wa, 'whatsapp') : '',
    ].join('')}</p>`,
    sectionTitle('Message'),
    messageBlock(req.message),
  ].join('')

  return brandedEmail({
    siteUrl,
    preheader: `${req.name}: ${req.message.slice(0, 110)}`,
    eyebrow: 'Contact enquiry',
    title: `${req.name} sent an enquiry`,
    intro: `Looking to ${req.purpose.toLowerCase()} in ${req.location}. Hit reply to answer them directly.`,
    body,
  })
}

export function buildEmailText(req: ContactEnquiryRequest, siteUrl?: string): string {
  return plainText('New contact enquiry', rows(req, siteUrl), ['Message:', req.message])
}
