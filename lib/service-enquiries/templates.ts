import type { ServiceEnquiryRequest } from './types'
import {
  brandedEmail,
  button,
  detailTable,
  noteBox,
  plainText,
  sectionTitle,
  siteBase,
  waLink,
  type DetailRow,
} from '@/lib/email/brand'

export function buildEmailSubject(req: ServiceEnquiryRequest): string {
  return `Service enquiry — ${req.serviceName} (${req.name})`
}

function contactRows(req: ServiceEnquiryRequest, siteUrl?: string): DetailRow[] {
  return [
    { label: 'Service', value: req.serviceName },
    { label: 'Name', value: req.name },
    { label: 'Email', value: req.email, href: `mailto:${req.email}` },
    { label: 'Phone', value: req.phone, href: `tel:${req.phone.replace(/\s/g, '')}` },
    ...(req.sourcePath
      ? [{ label: 'Sent from', value: req.sourcePath, href: `${siteBase(siteUrl)}${req.sourcePath}` }]
      : []),
  ]
}

function briefRows(req: ServiceEnquiryRequest): DetailRow[] {
  return Object.entries(req.brief ?? {}).map(([label, value]) => ({
    label,
    value: String(value ?? ''),
  }))
}

export function buildEmailHtml(req: ServiceEnquiryRequest, siteUrl?: string): string {
  const wa = waLink(
    req.phone,
    `Hi ${req.name}, this is Mojesu Properties about your ${req.serviceName} enquiry.`,
  )
  const brief = briefRows(req)
  const body = [
    detailTable(contactRows(req, siteUrl)),
    `<p style="margin:20px 0 0">${[
      button('Reply by email', `mailto:${req.email}`),
      wa ? button('WhatsApp', wa, 'whatsapp') : '',
    ].join('')}</p>`,
    sectionTitle('Project brief'),
    brief.some((r) => r.value.trim())
      ? detailTable(brief)
      : noteBox('No brief details were filled in.'),
  ].join('')

  return brandedEmail({
    siteUrl,
    preheader: `${req.name} is asking about ${req.serviceName}`,
    eyebrow: 'Service enquiry',
    title: `${req.serviceName} enquiry from ${req.name}`,
    intro: 'Hit reply to answer them directly.',
    body,
  })
}

export function buildEmailText(req: ServiceEnquiryRequest, siteUrl?: string): string {
  const brief = briefRows(req)
  return plainText('Service enquiry', contactRows(req, siteUrl), [
    'Brief:',
    ...(brief.length ? brief.map((r) => `${r.label}: ${r.value}`) : ['(none)']),
  ])
}
