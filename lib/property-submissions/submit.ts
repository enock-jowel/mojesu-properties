/**
 * Submission handler — save DB log, then email.
 * WhatsApp is client-side only (wa.me link returned for confirmation).
 * Email failure must not block the database write.
 * Does NOT create a public listing.
 */

import type { NotifyEnv } from '@/lib/viewing-bookings'
import { sendSubmissionEmail } from './email'
import {
  createConsoleStore,
  type SubmissionsStore,
  type D1DatabaseLike,
  createD1Store,
} from './store'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './templates'
import type {
  PropertySubmission,
  PropertySubmissionRequest,
  PropertySubmissionSubmitResult,
} from './types'

export interface SubmitContext {
  env: NotifyEnv
  store?: SubmissionsStore
  d1?: D1DatabaseLike
  now?: () => Date
  newId?: () => string
}

export async function submitPropertySubmission(
  req: PropertySubmissionRequest,
  ctx: SubmitContext,
): Promise<PropertySubmissionSubmitResult> {
  const now = ctx.now?.() ?? new Date()
  const id = ctx.newId?.() ?? crypto.randomUUID()

  const priceNotSure = Boolean(req.priceNotSure) || req.askingPrice == null
  const photos = Array.isArray(req.photos) ? req.photos.slice(0, 8) : []

  const submission: PropertySubmission = {
    id,
    listingMode: req.listingMode,
    category: req.category,
    location: req.location.trim(),
    roughAddress: req.roughAddress.trim(),
    bedrooms: req.category === 'house' ? (req.bedrooms ?? null) : null,
    bathrooms: req.category === 'house' ? (req.bathrooms ?? null) : null,
    approxPlotSize:
      req.category === 'land' ? (req.approxPlotSize?.trim() || null) : null,
    approxFloorArea:
      req.category === 'commercial'
        ? (req.approxFloorArea?.trim() || null)
        : null,
    photos,
    askingPrice: priceNotSure ? null : req.askingPrice,
    contactName: req.contactName.trim(),
    contactPhone: req.contactPhone.trim(),
    bestTimeToReach: req.bestTimeToReach,
    status: 'new',
    submittedAt: now.toISOString(),
  }

  const store =
    ctx.store ?? (ctx.d1 ? createD1Store(ctx.d1) : createConsoleStore())
  try {
    await store.insert(submission)
  } catch (err) {
    console.error('[propertySubmission] store failed', err)
  }

  const emailPayload: PropertySubmissionRequest = {
    ...req,
    photos,
    askingPrice: submission.askingPrice,
    priceNotSure,
  }

  const emailResult = await sendSubmissionEmail(ctx.env, emailPayload).catch(
    (err) => ({
      sent: false as const,
      error: err instanceof Error ? err.message : 'Email failed',
    }),
  )

  if (emailResult.error)
    console.warn('[propertySubmission] email:', emailResult.error)

  const message = buildWhatsAppMessage(emailPayload)
  const whatsappUrl = ctx.env.WHATSAPP_NUMBER
    ? buildWhatsAppUrl(ctx.env.WHATSAPP_NUMBER, message)
    : null

  return {
    ok: true,
    submissionId: id,
    emailSent: emailResult.sent,
    whatsappUrl,
  }
}
