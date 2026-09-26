type EmailResult = { sent: boolean; error?: string }

/** Retry transient notify-email failures; config errors (missing key/recipient) are not retried. */
export async function sendWithRetry(
  send: () => Promise<EmailResult>,
  attempts = 2,
): Promise<EmailResult> {
  let last: EmailResult = { sent: false, error: 'Email not attempted' }
  for (let i = 0; i < attempts; i++) {
    last = await send().catch((err) => ({
      sent: false,
      error: err instanceof Error ? err.message : 'Email failed',
    }))
    if (last.sent || /not set/.test(last.error ?? '')) return last
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 600))
  }
  return last
}
