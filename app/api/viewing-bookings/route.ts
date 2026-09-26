import { createServiceClient } from '@/lib/supabase/admin'
import {
  formatPriceUgx,
  getCoverImage,
  getProperties,
  imageUrl,
  priceSuffix,
  type Property,
} from '@/lib/properties'
import { emailImageUrl } from '@/lib/email/brand'
import {
  submitViewingBooking,
  type ViewingBookingPropertyRef,
  type ViewingBookingRequest,
} from '@/lib/viewing-bookings'
import {
  createSupabaseBookingsStore,
  resolveListingUuids,
} from '@/lib/viewing-bookings/supabase-store'
import { getNotifyConfig } from '@/lib/settings/notify-config'
import { guardLeadPost, leadJson, leadOptionsResponse } from '@/lib/api/lead-guard'

export const runtime = 'nodejs'

function listingSpecs(p: Property): string {
  if (p.category === 'land') return p.plotDimensions
  const parts: string[] = []
  if ('bedrooms' in p && p.bedrooms) parts.push(`${p.bedrooms} bed`)
  if ('bathrooms' in p && p.bathrooms) parts.push(`${p.bathrooms} bath`)
  if (p.sizeSqm) parts.push(`${p.sizeSqm} m²`)
  return parts.join(' · ')
}

export async function OPTIONS(request: Request) {
  return leadOptionsResponse(request)
}

export async function POST(request: Request) {
  const gate = await guardLeadPost(request, {
    rateKeyPrefix: 'booking',
    limit: 8,
    turnstileAction: 'viewing',
  })
  if (!gate.ok) return gate.response

  if (gate.honeypot) {
    return leadJson(
      {
        ok: true,
        bookingId: crypto.randomUUID(),
        emailSent: false,
        whatsappUrl: null,
      },
      200,
      request,
    )
  }

  const body = gate.body as ViewingBookingRequest & Record<string, unknown>
  const listingIds = Array.isArray(body.listingIds) ? body.listingIds : []
  if (
    listingIds.length === 0 ||
    !body.preferredDate ||
    !body.contactName?.trim() ||
    !body.contactPhone?.trim()
  ) {
    return leadJson(
      { ok: false, error: 'Missing required booking fields' },
      400,
      request,
    )
  }

  const env = await getNotifyConfig(
    process.env as Record<string, string | undefined>,
  )
  const siteUrl =
    env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(request.url).origin.replace(/\/$/, '')

  const all = await getProperties({ includeDrafts: false })
  const propertiesList = all.filter((p) => listingIds.includes(p.id))

  if (propertiesList.length === 0) {
    return leadJson({ ok: false, error: 'No matching listings' }, 400, request)
  }

  const properties: ViewingBookingPropertyRef[] = propertiesList.map((p) => {
    const url = `${siteUrl}/listings/${p.slug}/`
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      url,
      shortUrl: url,
      imageUrl: emailImageUrl(imageUrl(getCoverImage(p.images)), siteUrl),
      priceLabel: `${formatPriceUgx(p.priceUgx)}${priceSuffix(p)}`,
      location: [p.area, p.city].filter(Boolean).join(', '),
      specs: listingSpecs(p),
    }
  })

  try {
    const supabase = createServiceClient()
    const listingUuids = await resolveListingUuids(
      supabase,
      listingIds,
      properties.map((p) => p.slug),
    )
    const store = createSupabaseBookingsStore(supabase, {
      preferredTime: body.preferredTime ?? null,
      listingUuids,
    })

    const result = await submitViewingBooking(body, {
      env: { ...env, SITE_URL: siteUrl },
      properties,
      store,
    })

    return leadJson(result, result.ok ? 200 : 500, request)
  } catch (err) {
    console.error('[viewing-bookings API]', err)
    return leadJson(
      { ok: false, error: 'Unable to save booking. Please try again.' },
      500,
      request,
    )
  }
}
