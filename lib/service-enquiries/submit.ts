import type { NotifyEnv } from '@/lib/viewing-bookings'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendServiceEnquiryEmail } from './email'
import {
  createSupabaseServiceEnquiryStore,
  type ServiceEnquiryRow,
} from './supabase-store'
import type {
  ServiceEnquiryRequest,
  ServiceEnquirySubmitResult,
} from './types'

export interface SubmitServiceEnquiryContext {
  env: NotifyEnv
  supabase?: SupabaseClient
  now?: () => Date
  newId?: () => string
}

export async function submitServiceEnquiry(
  req: ServiceEnquiryRequest,
  ctx: SubmitServiceEnquiryContext,
): Promise<ServiceEnquirySubmitResult> {
  const now = ctx.now?.() ?? new Date()
  const id = ctx.newId?.() ?? crypto.randomUUID()

  const row: ServiceEnquiryRow = {
    id,
    serviceId: req.serviceId,
    serviceSlug: req.serviceSlug,
    serviceName: req.serviceName.trim(),
    brief: req.brief ?? {},
    name: req.name.trim(),
    email: req.email.trim(),
    phone: req.phone.trim(),
    sourcePath: req.sourcePath,
    status: 'new',
    createdAt: now.toISOString(),
  }

  if (!ctx.supabase) {
    return {
      ok: false,
      error: 'Unable to save enquiry. Please try again.',
    }
  }

  try {
    await createSupabaseServiceEnquiryStore(ctx.supabase).insert(row)
  } catch (err) {
    console.error('[serviceEnquiry] store failed', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unable to save enquiry.',
    }
  }

  const emailResult = await sendServiceEnquiryEmail(ctx.env, req).catch(
    (err) => ({
      sent: false as const,
      error: err instanceof Error ? err.message : 'Email failed',
    }),
  )

  if (emailResult.error)
    console.warn('[serviceEnquiry] email:', emailResult.error)

  return {
    ok: true,
    enquiryId: id,
    emailSent: emailResult.sent,
  }
}
