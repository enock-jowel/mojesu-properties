import { createServiceClient } from '@/lib/supabase/admin'
import { getNotifyConfig } from '@/lib/settings/notify-config'
import { submitContactEnquiry } from '@/lib/contact-enquiries'
import type { ContactEnquiryRequest } from '@/lib/contact-enquiries'
import { guardLeadPost, leadJson, leadOptionsResponse } from '@/lib/api/lead-guard'

export const runtime = 'nodejs'

export async function OPTIONS(request: Request) {
  return leadOptionsResponse(request)
}

export async function POST(request: Request) {
  const gate = await guardLeadPost(request, {
    rateKeyPrefix: 'contact',
    limit: 6,
    turnstileAction: 'contact',
  })
  if (!gate.ok) return gate.response

  if (gate.honeypot) {
    return leadJson(
      { ok: true, enquiryId: crypto.randomUUID(), emailSent: false },
      200,
      request,
    )
  }

  const body = gate.body as ContactEnquiryRequest & Record<string, unknown>

  if (
    !body.purpose?.trim() ||
    !body.location?.trim() ||
    !body.message?.trim() ||
    !body.name?.trim() ||
    !body.email?.trim() ||
    !body.phone?.trim()
  ) {
    return leadJson({ ok: false, error: 'Missing required fields' }, 400, request)
  }

  const env = await getNotifyConfig(
    process.env as Record<string, string | undefined>,
  )

  try {
    const supabase = createServiceClient()
    const result = await submitContactEnquiry(body, { env, supabase })
    return leadJson(result, result.ok ? 200 : 500, request)
  } catch (err) {
    console.error('[contact-enquiries API]', err)
    return leadJson(
      { ok: false, error: 'Unable to save enquiry. Please try again.' },
      500,
      request,
    )
  }
}
