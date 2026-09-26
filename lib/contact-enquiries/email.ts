import type { NotifyEnv } from '@/lib/viewing-bookings'
import { sendNotifyEmail } from '@/lib/email/send'
import { buildEmailHtml, buildEmailSubject, buildEmailText } from './templates'
import type { ContactEnquiryRequest } from './types'

export async function sendContactEnquiryEmail(
  env: NotifyEnv,
  req: ContactEnquiryRequest,
): Promise<{ sent: boolean; error?: string }> {
  return sendNotifyEmail(env, {
    subject: buildEmailSubject(req),
    html: buildEmailHtml(req, env.SITE_URL),
    text: buildEmailText(req, env.SITE_URL),
    replyTo: req.email,
  })
}
