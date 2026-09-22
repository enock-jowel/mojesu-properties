import { NextResponse } from 'next/server'
import { getProperties } from '@/lib/properties'
import { createServiceClient } from '@/lib/supabase/admin'
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
import {
  assertAllowedOrigin,
  checkRateLimit,
  clientIpFromRequest,
  isHoneypotTripped,
} from '@/lib/api/rate-limit'

export const runtime = 'nodejs'

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: Request) {
  if (!assertAllowedOrigin(request)) {
    return json({ ok: false, error: 'Forbidden origin' }, 403)
  }

  const ip = clientIpFromRequest(request)
  const limited = checkRateLimit(`booking:${ip}`, { limit: 8, windowMs: 60_000 })
  if (!limited.ok) {
    return json(
      { ok: false, error: 'Too many requests. Try again shortly.' },
      429,
    )
  }

  let body: ViewingBookingRequest & Record<string, unknown>
  try {
    body = (await request.json()) as ViewingBookingRequest &
      Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  if (isHoneypotTripped(body)) {
    return json({
      ok: true,
      bookingId: crypto.randomUUID(),
      emailSent: false,
      whatsappUrl: null,
    })
  }

  const listingIds = Array.isArray(body.listingIds) ? body.listingIds : []
  if (
    listingIds.length === 0 ||
    !body.preferredDate ||
    !body.contactName?.trim() ||
    !body.contactPhone?.trim()
  ) {
    return json({ ok: false, error: 'Missing required booking fields' }, 400)
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
    return json({ ok: false, error: 'No matching listings' }, 400)
  }

  const properties: ViewingBookingPropertyRef[] = propertiesList.map((p) => {
    const url = `${siteUrl}/listings/${p.slug}/`
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      url,
      shortUrl: url,
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

    return json(result, result.ok ? 200 : 500)
  } catch (err) {
    console.error('[viewing-bookings API]', err)
    return json(
      { ok: false, error: 'Unable to save booking. Please try again.' },
      500,
    )
  }
}
