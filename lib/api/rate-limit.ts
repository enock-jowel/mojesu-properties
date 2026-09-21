/**
 * In-memory sliding-window rate limit for public lead APIs.
 * Free, no UI. Best-effort per server instance (sufficient for Vercel serverless
 * burst protection; pair with Origin checks).
 */

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

/**
 * Reject cross-origin POSTs that don't come from our site (or missing Origin
 * when Referer also missing — browsers always send one for fetch from pages).
 */
export function assertAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const raw = origin || referer
  if (!raw) {
    // Allow server-to-server / curl for ops; rate limit still applies.
    return true
  }

  let host: string
  try {
    host = new URL(raw).hostname.toLowerCase()
  } catch {
    return false
  }

  const extras = (process.env.ALLOWED_LEAD_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  const allow = new Set([...DEFAULT_HOSTS, ...extras])
  if (allow.has(host)) return true
  // Preview deploys: *.vercel.app for this project
  if (host.endsWith('.vercel.app') && host.includes('mojesu')) return true
  return false
}

/** Bot honeypot: reject if a hidden field was filled. No UI required on forms
 * that omit the field — bots that POST arbitrary shapes get blocked. */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const traps = ['website', 'company_url', 'fax', 'hp_field']
  for (const key of traps) {
    const v = body[key]
    if (typeof v === 'string' && v.trim().length > 0) return true
  }
  return false
}
