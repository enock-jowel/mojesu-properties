import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import {
  assertAllowedOrigin,
  checkRateLimit,
  checkRateLimitDurable,
  clientIpFromRequest,
  isAllowedLeadHostname,
  isHoneypotTripped,
} from '@/lib/api/rate-limit'
import { verifyTurnstileToken } from '@/lib/api/turnstile'

export function leadCorsHeaders(request?: Request): HeadersInit {
  const origin = request?.headers.get('origin')
  let allowOrigin = 'https://mojesuproperties.com'
  if (origin) {
    try {
      const host = new URL(origin).hostname
      if (isAllowedLeadHostname(host)) allowOrigin = origin
    } catch {
      /* keep default */
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

export function leadOptionsResponse(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: leadCorsHeaders(request),
  })
}

export function leadJson(data: unknown, status = 200, request?: Request) {
  return NextResponse.json(data, {
    status,
    headers: request ? leadCorsHeaders(request) : undefined,
  })
}

export type LeadGuardOk = {
  ok: true
  ip: string
  body: Record<string, unknown>
  honeypot: boolean
}

export type LeadGuardFail = {
  ok: false
  response: NextResponse
}

/**
 * Shared gate for public lead POSTs: origin → rate limit → JSON → honeypot → Turnstile.
 */
export async function guardLeadPost(
  request: Request,
  opts: {
    rateKeyPrefix: string
    limit: number
    windowMs?: number
    turnstileAction: string
  },
): Promise<LeadGuardOk | LeadGuardFail> {
  if (!assertAllowedOrigin(request)) {
    return {
      ok: false,
      response: leadJson({ ok: false, error: 'Forbidden origin' }, 403, request),
    }
  }

  const ip = clientIpFromRequest(request)
  const windowMs = opts.windowMs ?? 60_000
  const memKey = `${opts.rateKeyPrefix}:${ip}`

  let limited
  try {
    const supabase = createServiceClient()
    limited = await checkRateLimitDurable(supabase, memKey, {
      limit: opts.limit,
      windowMs,
    })
  } catch (err) {
    console.warn('[lead-guard] durable rate limit unavailable', err)
    limited = checkRateLimit(memKey, { limit: opts.limit, windowMs })
  }
  if (!limited.ok) {
    return {
      ok: false,
      response: leadJson(
        { ok: false, error: 'Too many requests. Try again shortly.' },
        429,
        request,
      ),
    }
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return {
      ok: false,
      response: leadJson({ ok: false, error: 'Invalid JSON body' }, 400, request),
    }
  }

  if (isHoneypotTripped(body)) {
    return { ok: true, ip, body, honeypot: true }
  }

  const turnstile = await verifyTurnstileToken(
    body.turnstileToken ?? body['cf-turnstile-response'],
    { expectedAction: opts.turnstileAction, remoteip: ip },
  )
  if (!turnstile.ok) {
    return {
      ok: false,
      response: leadJson({ ok: false, error: turnstile.error }, 403, request),
    }
  }

  return { ok: true, ip, body, honeypot: false }
}
