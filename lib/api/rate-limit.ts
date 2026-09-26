/**
 * Rate limit + origin + honeypot for public lead APIs.
 * Memory Map is best-effort per instance; durable path uses Postgres
 * `consume_rate_limit` (migration 009) via service role.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number }

export function checkRateLimit(
  key: string,
  opts: { limit: number; windowMs: number } = { limit: 8, windowMs: 60_000 },
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true }
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { ok: true }
}

/** Durable sliding window via Postgres RPC; falls back to memory on failure. */
export async function checkRateLimitDurable(
  supabase: SupabaseClient,
  key: string,
  opts: { limit: number; windowMs: number } = { limit: 8, windowMs: 60_000 },
): Promise<RateLimitResult> {
  const windowSec = Math.max(1, Math.ceil(opts.windowMs / 1000))
  try {
    const { data, error } = await supabase.rpc('consume_rate_limit', {
      p_key: key,
      p_limit: opts.limit,
      p_window_seconds: windowSec,
    })
    if (error) throw error

    const row = Array.isArray(data) ? data[0] : data
    if (row && typeof row === 'object' && 'allowed' in row) {
      const allowed = Boolean((row as { allowed: boolean }).allowed)
      if (allowed) return { ok: true }
      const retry = Number((row as { retry_after_sec?: number }).retry_after_sec)
      return {
        ok: false,
        retryAfterSec: Number.isFinite(retry) && retry > 0 ? retry : 60,
      }
    }
    // RPC executed (counter may have moved); avoid a second memory increment.
    console.warn('[rate-limit] unexpected RPC shape; allowing request')
    return { ok: true }
  } catch (err) {
    console.warn('[rate-limit] durable failed; using memory', err)
  }
  return checkRateLimit(key, opts)
}

/** Prefer CF / Vercel client IP headers, then remote. */
export function clientIpFromRequest(request: Request): string {
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

const DEFAULT_HOSTS = [
  'mojesuproperties.com',
  'www.mojesuproperties.com',
  'mojesu-preview.vercel.app',
  'localhost',
  '127.0.0.1',
]

export function isAllowedLeadHostname(host: string): boolean {
  const h = host.toLowerCase()
  const extras = (process.env.ALLOWED_LEAD_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const allow = new Set([...DEFAULT_HOSTS, ...extras])
  if (allow.has(h)) return true
  if (h.endsWith('.vercel.app') && h.includes('mojesu')) return true
  return false
}

function isProductionLike(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  )
}

/**
 * Reject cross-origin POSTs. In production, missing Origin and Referer is denied
 * (browsers send at least one for page fetch). Local/dev still allows bare curl.
 */
export function assertAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const raw = origin || referer
  if (!raw) {
    return !isProductionLike()
  }

  let host: string
  try {
    host = new URL(raw).hostname.toLowerCase()
  } catch {
    return false
  }

  return isAllowedLeadHostname(host)
}

/** Bot honeypot: reject if a hidden field was filled. */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const traps = ['website', 'company_url', 'fax', 'hp_field']
  for (const key of traps) {
    const v = body[key]
    if (typeof v === 'string' && v.trim().length > 0) return true
  }
  return false
}
