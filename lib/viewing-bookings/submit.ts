/**
 * Submission handler — save DB log, then email.
 * WhatsApp is client-side only (wa.me link returned for BookingConfirmation).
 * Email failure must not block the database write.
 * Persistence failure must not report success.
 */

import { sendBookingEmail } from './email'
import { shortenUrl } from './shorten'
import {
  type BookingsStore,
  type D1DatabaseLike,
  createD1Store,
} from './store'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './templates'
import {
  VIEWING_FEE_UGX,
  type NotifyEnv,
  type ViewingBooking,
  type ViewingBookingPropertyRef,
  type ViewingBookingRequest,
  type ViewingBookingSubmitResult,
} from './types'
import { createServiceClient } from '@/lib/supabase/admin'

export interface SubmitContext {
  env: NotifyEnv
  properties: ViewingBookingPropertyRef[]
  store?: BookingsStore
  d1?: D1DatabaseLike
  now?: () => Date
  newId?: () => string
}

export async function submitViewingBooking(
  req: ViewingBookingRequest,
  ctx: SubmitContext,
): Promise<ViewingBookingSubmitResult> {
  const now = ctx.now?.() ?? new Date()
  const id = ctx.newId?.() ?? crypto.randomUUID()

  const booking: ViewingBooking = {
    id,
    listingIds: req.listingIds,
    preferredDate: req.preferredDate,
    contactName: req.contactName.trim(),
    contactPhone: req.contactPhone.trim(),
    contactEmail: req.contactEmail.trim(),
    status: 'requested',
    requestedAt: now.toISOString(),
  }

  if (!ctx.store && !ctx.d1) {
    return {
      ok: false,
      error: 'Unable to save booking. Please try again.',
    }
  }

  const store = ctx.store ?? createD1Store(ctx.d1!)
  try {
    await store.insert(booking)
  } catch (err) {
    console.error('[viewingBooking] store failed', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unable to save booking.',
    }
  }

  const properties: ViewingBookingPropertyRef[] = await Promise.all(
    ctx.properties.map(async (p) => ({
      ...p,
      shortUrl: await shortenUrl(p.url, ctx.env.BITLY_ACCESS_TOKEN),
    })),
  )

  const emailResult = await sendBookingEmail(ctx.env, req, properties).catch(
    (err) => ({
      sent: false as const,
      error: err instanceof Error ? err.message : 'Email failed',
    }),
  )

  if (emailResult.error) console.warn('[viewingBooking] email:', emailResult.error)

  const feeUgx = await readViewingFeeUgx()
  const message = buildWhatsAppMessage(req, properties, feeUgx)
  const whatsappUrl = ctx.env.WHATSAPP_NUMBER
    ? buildWhatsAppUrl(ctx.env.WHATSAPP_NUMBER, message)
    : null

  return {
    ok: true,
    bookingId: id,
    emailSent: emailResult.sent,
    whatsappUrl,
  }
}

export function resolveNotifyEnv(
  source: Record<string, string | undefined>,
): NotifyEnv {
  return {
    SITE_URL: (source.SITE_URL || source.NEXT_PUBLIC_SITE_URL || '').replace(
      /\/$/,
      '',
    ),
    NOTIFY_EMAIL_TO: source.NOTIFY_EMAIL_TO || '',
    NOTIFY_EMAIL_FROM: source.NOTIFY_EMAIL_FROM,
    RESEND_API_KEY: source.RESEND_API_KEY,
    WHATSAPP_NUMBER:
      source.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      source.WHATSAPP_NUMBER ||
      source.NOTIFY_WHATSAPP_NUMBER ||
      source.NEXT_PUBLIC_NOTIFY_WHATSAPP_NUMBER ||
      '',
    BITLY_ACCESS_TOKEN: source.BITLY_ACCESS_TOKEN,
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
