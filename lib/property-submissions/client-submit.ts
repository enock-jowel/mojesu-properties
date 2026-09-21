'use client'

import {
  buildWhatsAppUrl,
  buildWhatsAppMessage,
  type PropertySubmissionRequest,
  type PropertySubmissionSubmitResult,
} from '@/lib/property-submissions'

const PUBLIC_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  process.env.NEXT_PUBLIC_NOTIFY_WHATSAPP_NUMBER ||
  '256780827159'

const API_URL =
  process.env.NEXT_PUBLIC_SUBMISSIONS_API_URL ?? '/api/property-submissions'

function withWhatsAppUrl(
  result: PropertySubmissionSubmitResult,
  req: PropertySubmissionRequest,
): PropertySubmissionSubmitResult {
  if (result.whatsappUrl || !PUBLIC_WHATSAPP_NUMBER) return result
  return {
    ...result,
    whatsappUrl: buildWhatsAppUrl(
      PUBLIC_WHATSAPP_NUMBER,
      buildWhatsAppMessage(req),
    ),
  }
}

/**
 * Submit a List With Us property intake.
 * On API failure returns ok:false (wa.me still attached). Does NOT fake success.
 */
export async function submitPropertySubmissionClient(
  req: PropertySubmissionRequest,
): Promise<PropertySubmissionSubmitResult> {
  const leanReq: PropertySubmissionRequest = {
    ...req,
    photos: (req.photos ?? []).map((_, i) => `photo-${i + 1}`),
  }

  const whatsappUrl = PUBLIC_WHATSAPP_NUMBER
    ? buildWhatsAppUrl(PUBLIC_WHATSAPP_NUMBER, buildWhatsAppMessage(leanReq))
    : null

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })

    if (!res.ok) {
      console.warn('[propertySubmission] API error', res.status)
      return {
        ok: false,
        error: `Submission failed (${res.status})`,
        emailSent: false,
        whatsappUrl,
      }
    }

    const data = (await res.json()) as PropertySubmissionSubmitResult
    return withWhatsAppUrl(data, leanReq)
  } catch (err) {
    console.warn('[propertySubmission] API unreachable', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
      emailSent: false,
      whatsappUrl,
    }
  }
}
