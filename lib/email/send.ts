import type { NotifyEnv } from '@/lib/viewing-bookings/types'

export type NotifyEmail = {
  subject: string
  html: string
  text: string
  replyTo?: string
}

/** Send a manager notification via Resend to NOTIFY_EMAIL_TO. */
export async function sendNotifyEmail(
  env: NotifyEnv,
  email: NotifyEmail,
): Promise<{ sent: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    return {
      sent: false,
      error: 'RESEND_API_KEY not set — email skipped (configure Resend to enable).',
    }
  }
  if (!env.NOTIFY_EMAIL_TO) {
    return { sent: false, error: 'NOTIFY_EMAIL_TO not set — email skipped.' }
  }

  const replyTo = email.replyTo?.trim()
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.NOTIFY_EMAIL_FROM ?? 'Mojesu Properties <hello@mojesuproperties.com>',
        to: [env.NOTIFY_EMAIL_TO],
        ...(replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)
          ? { reply_to: replyTo }
          : {}),
        subject: email.subject,
        html: email.html,
        text: email.text,
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
