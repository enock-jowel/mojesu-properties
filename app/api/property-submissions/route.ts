import { createServiceClient } from '@/lib/supabase/admin'
import {
  submitPropertySubmission,
  type PropertySubmissionRequest,
} from '@/lib/property-submissions'
import {
  createSupabaseSubmissionsStore,
  persistSubmissionPhotos,
  SUBMISSION_PHOTO_MAX_COUNT,
} from '@/lib/property-submissions/supabase-store'
import { getNotifyConfig } from '@/lib/settings/notify-config'
import { guardLeadPost, leadJson, leadOptionsResponse } from '@/lib/api/lead-guard'

export const runtime = 'nodejs'

export async function OPTIONS(request: Request) {
  return leadOptionsResponse(request)
}

export async function POST(request: Request) {
  const gate = await guardLeadPost(request, {
    rateKeyPrefix: 'submission',
    limit: 6,
    turnstileAction: 'list_with_us',
  })
  if (!gate.ok) return gate.response

  if (gate.honeypot) {
    return leadJson(
      {
        ok: true,
        submissionId: crypto.randomUUID(),
        emailSent: false,
        whatsappUrl: null,
      },
      200,
      request,
    )
  }

  const body = gate.body as PropertySubmissionRequest & Record<string, unknown>

  if (
    !body.listingMode ||
    !body.category ||
    !body.location?.trim() ||
    !body.contactName?.trim() ||
    !body.contactPhone?.trim() ||
    !body.bestTimeToReach
  ) {
    return leadJson(
      { ok: false, error: 'Missing required submission fields' },
      400,
      request,
    )
  }

  const env = await getNotifyConfig(
    process.env as Record<string, string | undefined>,
  )
  const siteUrl =
    env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(request.url).origin.replace(/\/$/, '')

  const submissionId = crypto.randomUUID()
  const photos = Array.isArray(body.photos)
    ? body.photos.slice(0, SUBMISSION_PHOTO_MAX_COUNT)
    : []

  try {
    const supabase = createServiceClient()
    const photoUrls = await persistSubmissionPhotos(
      supabase,
      submissionId,
      photos,
    )
    const store = createSupabaseSubmissionsStore(supabase, { photoUrls })

    const result = await submitPropertySubmission(
      { ...body, photos },
      {
        env: { ...env, SITE_URL: siteUrl },
        store,
        newId: () => submissionId,
        photoUrls,
      },
    )

    return leadJson(result, result.ok ? 200 : 500, request)
  } catch (err) {
    console.error('[property-submissions API]', err)
    return leadJson(
      { ok: false, error: 'Unable to save submission. Please try again.' },
      500,
      request,
    )
  }
}
