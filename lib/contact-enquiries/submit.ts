import type { NotifyEnv } from '@/lib/viewing-bookings'
import { sendContactEnquiryEmail } from './email'
import type { ContactEnquiryRequest, ContactEnquirySubmitResult } from './types'
import {
  createSupabaseContactStore,
  type ContactEnquiryRow,
} from './supabase-store'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SubmitContactContext {
  env: NotifyEnv
  supabase?: SupabaseClient
  now?: () => Date
  newId?: () => string
}

export async function submitContactEnquiry(
  req: ContactEnquiryRequest,
  ctx: SubmitContactContext,
): Promise<ContactEnquirySubmitResult> {
  const now = ctx.now?.() ?? new Date()
  const id = ctx.newId?.() ?? crypto.randomUUID()

  const row: ContactEnquiryRow = {
    id,
    purpose: req.purpose.trim(),
    location: req.location.trim(),
    message: req.message.trim(),
    name: req.name.trim(),
    email: req.email.trim(),
    phone: req.phone.trim(),
    sourcePath: req.sourcePath,
    status: 'new',
    createdAt: now.toISOString(),
  }

  if (ctx.supabase) {
    try {
      await createSupabaseContactStore(ctx.supabase).insert(row)
    } catch (err) {
      console.error('[contactEnquiry] store failed', err)
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Store failed',
      }
    }
  } else {
    console.info('[contactEnquiry] no supabase — logged only', row)
  }

  const emailResult = await sendContactEnquiryEmail(ctx.env, req).catch(
    (err) => ({
      sent: false as const,
      error: err instanceof Error ? err.message : 'Email failed',
    }),
  )

  if (emailResult.error)
    console.warn('[contactEnquiry] email:', emailResult.error)

  return {
    ok: true,
    enquiryId: id,
    emailSent: emailResult.sent,
  }
}
