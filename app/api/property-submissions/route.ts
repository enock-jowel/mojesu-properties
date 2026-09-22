import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import {
  submitPropertySubmission,
  type PropertySubmissionRequest,
} from '@/lib/property-submissions'
import {
  createSupabaseSubmissionsStore,
  persistSubmissionPhotos,
} from '@/lib/property-submissions/supabase-store'
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
  const limited = checkRateLimit(`submission:${ip}`, {
    limit: 6,
    windowMs: 60_000,
  })
  if (!limited.ok) {
    return json(
      { ok: false, error: 'Too many requests. Try again shortly.' },
      429,
    )
  }

  let body: PropertySubmissionRequest & Record<string, unknown>
  try {
    body = (await request.json()) as PropertySubmissionRequest &
      Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  if (isHoneypotTripped(body)) {
    return json({
      ok: true,
      submissionId: crypto.randomUUID(),
      emailSent: false,
      whatsappUrl: null,
    })
  }

  if (
    !body.listingMode ||
    !body.category ||
    !body.location?.trim() ||
    !body.contactName?.trim() ||
    !body.contactPhone?.trim() ||
    !body.bestTimeToReach
  ) {
    return json({ ok: false, error: 'Missing required submission fields' }, 400)
  }

  const env = await getNotifyConfig(
    process.env as Record<string, string | undefined>,
  )
  const siteUrl =
    env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(request.url).origin.replace(/\/$/, '')

  const submissionId = crypto.randomUUID()
  const photos = Array.isArray(body.photos) ? body.photos.slice(0, 8) : []

  try {
    const supabase = createServiceClient()
    const photoUrls = await persistSubmissionPhotos(
      supabase,
      submissionId,
      photos,
    )
    const store = createSupabaseSubmissionsStore(supabase, { photoUrls })

    const result = await submitPropertySubmission(
      { ...body, photos },
      {
        env: { ...env, SITE_URL: siteUrl },
        store,
        newId: () => submissionId,
      },
    )

    return json(result, result.ok ? 200 : 500)
  } catch (err) {
    console.error('[property-submissions API]', err)
    return json(
      { ok: false, error: 'Unable to save submission. Please try again.' },
      500,
    )
  }
}
