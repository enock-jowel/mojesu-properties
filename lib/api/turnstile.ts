/**
 * Cloudflare Turnstile siteverify for public lead APIs.
 * When TURNSTILE_SECRET is unset, verification is skipped (local/dev).
 * When set, a non-empty token is required and must pass siteverify.
 */

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileResult =
  | { ok: true; skipped: boolean }
  | { ok: false; error: string }

function expectedHostnames(): Set<string> {
  const fromEnv = (process.env.TURNSTILE_HOSTNAMES || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)

  const defaults = [
    'mojesuproperties.com',
    'www.mojesuproperties.com',
    'mojesu-preview.vercel.app',
    'localhost',
    '127.0.0.1',
  ]

  return new Set([...defaults, ...fromEnv])
}

export function isTurnstileRequired(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET?.trim())
}

export async function verifyTurnstileToken(
  token: unknown,
  opts?: { expectedAction?: string; remoteip?: string },
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET?.trim()
  if (!secret) {
    return { ok: true, skipped: true }
  }

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { ok: false, error: 'Bot check failed. Refresh and try again.' }
  }

  const hostnames = expectedHostnames()
  if (hostnames.size === 0) {
    return { ok: false, error: 'Bot check misconfigured.' }
  }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (opts?.remoteip && opts.remoteip !== 'unknown') {
      body.set('remoteip', opts.remoteip)
    }

    const res = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    })

    const data = (await res.json()) as {
      success?: boolean
      action?: string
      hostname?: string
      'error-codes'?: string[]
    }

    if (!data.success) {
      console.warn('[turnstile] siteverify failed', data['error-codes'])
      return { ok: false, error: 'Bot check failed. Refresh and try again.' }
    }

    if (opts?.expectedAction && data.action && data.action !== opts.expectedAction) {
      return { ok: false, error: 'Bot check failed. Refresh and try again.' }
    }

    const host = (data.hostname || '').toLowerCase()
    if (
      host &&
      !hostnames.has(host) &&
      !(host.endsWith('.vercel.app') && host.includes('mojesu'))
    ) {
      return { ok: false, error: 'Bot check failed. Refresh and try again.' }
    }

    return { ok: true, skipped: false }
  } catch (err) {
    console.error('[turnstile] siteverify error', err)
    return { ok: false, error: 'Bot check unavailable. Try again shortly.' }
  }
}
