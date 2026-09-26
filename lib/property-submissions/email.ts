import type { NotifyEnv } from '@/lib/viewing-bookings'
import { sendNotifyEmail } from '@/lib/email/send'
import { buildEmailHtml, buildEmailSubject, buildEmailText } from './templates'
import type { PropertySubmissionRequest } from './types'

/**
 * Send manager email via Resend.
 * Requires RESEND_API_KEY + NOTIFY_EMAIL_TO (and optional NOTIFY_EMAIL_FROM).
 */
export async function sendSubmissionEmail(
  env: NotifyEnv,
  req: PropertySubmissionRequest,
): Promise<{ sent: boolean; error?: string }> {
  return sendNotifyEmail(env, {
    subject: buildEmailSubject(req),
    html: buildEmailHtml(req, env.SITE_URL),
    text: buildEmailText(req),
  })
}
