import type { NotifyEnv } from './types'
import { buildEmailHtml, buildEmailSubject } from './templates'
import type { ViewingBookingPropertyRef, ViewingBookingRequest } from './types'
import { VIEWING_FEE_UGX } from './types'
import { createServiceClient } from '@/lib/supabase/admin'

/**
 * Send manager email via Resend.
 * Requires RESEND_API_KEY + NOTIFY_EMAIL_TO (and optional NOTIFY_EMAIL_FROM).
 */
export async function sendBookingEmail(
  env: NotifyEnv,
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
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
    const feeUgx = await readViewingFeeUgx()
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [env.NOTIFY_EMAIL_TO],
        subject: buildEmailSubject(req, properties),
        html: buildEmailHtml(req, properties, feeUgx),
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

async function readViewingFeeUgx(): Promise<number> {
  try {
    const admin = createServiceClient()
    const { data } = await admin
      .from('site_content')
      .select('data')
      .eq('key', 'viewing')
      .maybeSingle()
    const fee = (data?.data as { feeUgx?: number } | null)?.feeUgx
    if (typeof fee === 'number' && Number.isFinite(fee)) return fee
  } catch {
    /* fall through */
  }
  return VIEWING_FEE_UGX
}
