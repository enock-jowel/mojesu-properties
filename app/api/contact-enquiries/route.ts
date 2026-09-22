import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { getNotifyConfig } from '@/lib/settings/notify-config'
import { submitContactEnquiry } from '@/lib/contact-enquiries'
import type { ContactEnquiryRequest } from '@/lib/contact-enquiries'
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
  const limited = checkRateLimit(`contact:${ip}`, { limit: 6, windowMs: 60_000 })
  if (!limited.ok) {
    return json(
      { ok: false, error: 'Too many requests. Try again shortly.' },
      429,
    )
  }

  let body: ContactEnquiryRequest & Record<string, unknown>
  try {
    body = (await request.json()) as ContactEnquiryRequest &
      Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  if (isHoneypotTripped(body)) {
    return json({ ok: true, enquiryId: crypto.randomUUID(), emailSent: false })
  }

  if (
    !body.purpose?.trim() ||
    !body.location?.trim() ||
    !body.message?.trim() ||
    !body.name?.trim() ||
    !body.email?.trim() ||
    !body.phone?.trim()
  ) {
    return json({ ok: false, error: 'Missing required fields' }, 400)
  }

  const env = await getNotifyConfig(
    process.env as Record<string, string | undefined>,
  )

  try {
    const supabase = createServiceClient()
    const result = await submitContactEnquiry(body, { env, supabase })
    return json(result, result.ok ? 200 : 500)
  } catch (err) {
    console.error('[contact-enquiries API]', err)
    return json(
      { ok: false, error: 'Unable to save enquiry. Please try again.' },
      500,
    )
  }
}
