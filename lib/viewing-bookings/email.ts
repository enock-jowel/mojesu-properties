import type { NotifyEnv } from './types'
import { buildEmailHtml, buildEmailSubject, buildEmailText } from './templates'
import type { ViewingBookingPropertyRef, ViewingBookingRequest } from './types'
import { VIEWING_FEE_UGX } from './types'
import { createServiceClient } from '@/lib/supabase/admin'
import { sendNotifyEmail } from '@/lib/email/send'

/**
 * Send manager email via Resend.
 * Requires RESEND_API_KEY + NOTIFY_EMAIL_TO (and optional NOTIFY_EMAIL_FROM).
 */
export async function sendBookingEmail(
  env: NotifyEnv,
  req: ViewingBookingRequest,
  properties: ViewingBookingPropertyRef[],
): Promise<{ sent: boolean; error?: string }> {
  const feeUgx = await readViewingFeeUgx()
  return sendNotifyEmail(env, {
    subject: buildEmailSubject(req, properties),
    html: buildEmailHtml(req, properties, feeUgx, env.SITE_URL),
    text: buildEmailText(req, properties, feeUgx),
    replyTo: req.contactEmail,
  })
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
