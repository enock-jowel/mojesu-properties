/**
 * Render sample branded notification emails to HTML files; optionally send them.
 *
 *   node ./node_modules/tsx/dist/cli.mjs scripts/preview-emails.ts            # writes .tmp/emails/*.html
 *   node --env-file=.env.mdbx.local ./node_modules/tsx/dist/cli.mjs scripts/preview-emails.ts --send
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as booking from '@/lib/viewing-bookings/templates'
import * as submission from '@/lib/property-submissions/templates'
import * as contact from '@/lib/contact-enquiries/templates'
import * as service from '@/lib/service-enquiries/templates'
import { sendNotifyEmail } from '@/lib/email/send'
import { emailImageUrl } from '@/lib/email/brand'

const SITE = 'https://mojesuproperties.com'
const unsplash = (id: string) =>
  emailImageUrl(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`, SITE)

const bookingReq = {
  listingIds: ['a', 'b'],
  preferredDate: '2026-10-03',
  preferredTime: '10:00 AM',
  contactName: 'Sarah Namuli',
  contactPhone: '0772 123 456',
  contactEmail: 'sarah@example.com',
}
const bookingProps = [
  {
    id: 'a',
    slug: 'modern-2-bedroom-apartment-ntinda',
    title: 'Modern 2 Bedroom Apartment',
    url: `${SITE}/listings/modern-2-bedroom-apartment-ntinda/`,
    shortUrl: `${SITE}/listings/modern-2-bedroom-apartment-ntinda/`,
    imageUrl: unsplash('photo-1502672260266-1c1ef2d93688'),
    priceLabel: 'UGX 2,500,000/month',
    location: 'Ntinda, Kampala',
    specs: '2 bed · 2 bath · 120 m²',
  },
  {
    id: 'b',
    slug: 'spacious-3-bedroom-house-kira',
    title: 'Spacious 3 Bedroom House',
    url: `${SITE}/listings/spacious-3-bedroom-house-kira/`,
    shortUrl: `${SITE}/listings/spacious-3-bedroom-house-kira/`,
    imageUrl: unsplash('photo-1568605114967-8130f3a36994'),
    priceLabel: 'UGX 3,200,000/month',
    location: 'Kira, Wakiso',
    specs: '3 bed · 2 bath · 160 m²',
  },
]

const submissionReq = {
  listingMode: 'sale' as const,
  category: 'house' as const,
  location: 'Muyenga',
  roughAddress: 'Off Tank Hill Road',
  bedrooms: 4,
  bathrooms: 3,
  photos: [
    unsplash('photo-1600596542815-ffad4c1539a9')!,
    unsplash('photo-1600585154340-be6161a56a0c')!,
    unsplash('photo-1600047509807-ba8f99d2cdde')!,
  ],
  askingPrice: 850_000_000,
  contactName: 'David Okello',
  contactPhone: '0701 555 010',
  bestTimeToReach: 'Evening' as const,
}

const contactReq = {
  purpose: 'Rent',
  location: 'Kololo',
  message:
    'Hello, I am relocating to Kampala in November and looking for a furnished 2 bedroom apartment in Kololo or Naguru. Budget around UGX 4m per month.',
  name: 'Grace Achieng',
  email: 'grace@example.com',
  phone: '+256 780 000 111',
  sourcePath: '/contact/',
}

const serviceReq = {
  serviceId: 'valuation',
  serviceSlug: 'property-valuation',
  serviceName: 'Property valuation',
  brief: { 'Property type': 'Commercial building', Location: 'Nakawa', Timeline: 'Within 2 weeks' },
  name: 'Peter Mugisha',
  email: 'peter@example.com',
  phone: '0752 222 333',
  sourcePath: '/services/property-valuation/',
}

const emails = [
  {
    key: 'viewing-booking',
    subject: booking.buildEmailSubject(bookingReq, bookingProps),
    html: booking.buildEmailHtml(bookingReq, bookingProps, 70_000, SITE),
    text: booking.buildEmailText(bookingReq, bookingProps, 70_000),
  },
  {
    key: 'list-with-us',
    subject: submission.buildEmailSubject(submissionReq),
    html: submission.buildEmailHtml(submissionReq, SITE),
    text: submission.buildEmailText(submissionReq),
  },
  {
    key: 'contact',
    subject: contact.buildEmailSubject(contactReq),
    html: contact.buildEmailHtml(contactReq, SITE),
    text: contact.buildEmailText(contactReq, SITE),
  },
  {
    key: 'service',
    subject: service.buildEmailSubject(serviceReq),
    html: service.buildEmailHtml(serviceReq, SITE),
    text: service.buildEmailText(serviceReq, SITE),
  },
]

async function main() {
  const dir = resolve('.tmp/emails')
  mkdirSync(dir, { recursive: true })
  for (const e of emails) {
    writeFileSync(resolve(dir, `${e.key}.html`), e.html)
    console.log('wrote', `.tmp/emails/${e.key}.html`)
  }

  if (!process.argv.includes('--send')) return
  const env = {
    SITE_URL: SITE,
    NOTIFY_EMAIL_TO: process.env.NOTIFY_EMAIL_TO || 'hello@mojesuproperties.com',
    NOTIFY_EMAIL_FROM: process.env.NOTIFY_EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    WHATSAPP_NUMBER: '',
  }
  for (const e of emails) {
    const r = await sendNotifyEmail(env, {
      subject: `[Preview] ${e.subject}`,
      html: e.html,
      text: e.text,
    })
    console.log('send', e.key, r.sent ? 'ok' : r.error)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
