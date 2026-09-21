import type { NotifyEnv } from '@/lib/viewing-bookings'
import { buildEmailHtml, buildEmailSubject } from './templates'
import type { PropertySubmissionRequest } from './types'

/**
 * Send manager email via Resend.
 * Requires RESEND_API_KEY + NOTIFY_EMAIL_TO (and optional NOTIFY_EMAIL_FROM).
 */
export async function sendSubmissionEmail(
  env: NotifyEnv,
  req: PropertySubmissionRequest,
): Promise<{ sent: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    return {
      sent: false,
      error:
        'RESEND_API_KEY not set — email skipped (configure Resend to enable).',
    }
  }
  if (!env.NOTIFY_EMAIL_TO) {
    return { sent: false, error: 'NOTIFY_EMAIL_TO not set — email skipped.' }
  }

  const from =
    env.NOTIFY_EMAIL_FROM ?? 'Mojesu <hello@mojesuproperties.com>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [env.NOTIFY_EMAIL_TO],
        subject: buildEmailSubject(req),
        html: buildEmailHtml(req),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return { sent: false, error: `Resend ${res.status}: ${body}` }
    }
    return { sent: true }
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : 'Email send failed',
    }
  }
}
