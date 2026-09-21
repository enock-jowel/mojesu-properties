/**
 * Resolve notification email + WhatsApp: DB settings first, env as fallback.
 */
import { createServiceClient } from '@/lib/supabase/admin'
import {
  resolveNotifyEnv,
  type NotifyEnv,
} from '@/lib/viewing-bookings'

export async function getNotifyConfig(
  envSource: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): Promise<NotifyEnv> {
  const base = resolveNotifyEnv(envSource)

  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('notification_settings')
      .select('notify_email, whatsapp_number')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return base

    const email = data.notify_email?.trim()
    const wa = data.whatsapp_number?.replace(/\D/g, '')

    return {
      ...base,
      NOTIFY_EMAIL_TO: email || base.NOTIFY_EMAIL_TO,
      WHATSAPP_NUMBER: wa || base.WHATSAPP_NUMBER,
    }
  } catch {
    return base
  }
}
