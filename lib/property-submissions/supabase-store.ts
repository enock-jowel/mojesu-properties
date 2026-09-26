import type { SupabaseClient } from '@supabase/supabase-js'
import type { SubmissionsStore } from './store'
import type { PropertySubmission } from './types'

/** Server-enforced caps (client also caps at ~1.2MB / 8 files). */
export const SUBMISSION_PHOTO_MAX_COUNT = 8
export const SUBMISSION_PHOTO_MAX_BYTES = 1_200_000
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

function parseFloorArea(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(String(raw).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

function normalizeContentType(raw: string): string {
  return raw.split(';')[0]?.trim().toLowerCase() || ''
}

/**
 * Persist intake photos: keep http(s) URLs; upload data URLs via service role.
 * Rejects oversized / non-image payloads server-side.
 */
export async function persistSubmissionPhotos(
  supabase: SupabaseClient,
  submissionId: string,
  photos: string[],
): Promise<string[]> {
  const out: string[] = []
  const limited = photos.slice(0, SUBMISSION_PHOTO_MAX_COUNT)

  for (let i = 0; i < limited.length; i++) {
    const photo = limited[i]
    if (!photo) continue

    if (/^https?:\/\//i.test(photo)) {
      try {
        const u = new URL(photo)
        if (u.protocol !== 'https:' && u.protocol !== 'http:') continue
        if (photo.length > 2048) continue
        out.push(photo)
      } catch {
        /* skip bad URL */
      }
      continue
    }

    if (!photo.startsWith('data:')) continue

    const match = /^data:([^;]+);base64,(.+)$/.exec(photo)
    if (!match) continue

    const contentType = normalizeContentType(match[1] || '')
    if (!ALLOWED_MIME.has(contentType)) {
      console.warn('[propertySubmission] rejected photo MIME', contentType)
      continue
    }

    // Base64 expands ~4/3; reject before allocating huge buffers.
    const b64 = match[2]
    const approxBytes = Math.floor((b64.length * 3) / 4)
    if (approxBytes > SUBMISSION_PHOTO_MAX_BYTES) {
      console.warn('[propertySubmission] rejected oversized photo', approxBytes)
      continue
    }
    if (b64.length > SUBMISSION_PHOTO_MAX_BYTES * 2) {
      continue
    }

    let bytes: Buffer
    try {
      bytes = Buffer.from(b64, 'base64')
    } catch {
      continue
    }
    if (bytes.byteLength === 0 || bytes.byteLength > SUBMISSION_PHOTO_MAX_BYTES) {
      console.warn(
        '[propertySubmission] rejected photo byte length',
        bytes.byteLength,
      )
      continue
    }

    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
        ? 'webp'
        : 'jpg'
    const path = `submissions/${submissionId}/${i}.${ext}`
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(path, bytes, { contentType, upsert: true })
    if (error) {
      console.warn('[propertySubmission] photo upload failed', error.message)
      continue
    }
    const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
    out.push(data.publicUrl)
  }
  return out
}

export function createSupabaseSubmissionsStore(
  supabase: SupabaseClient,
  options?: { photoUrls?: string[] },
): SubmissionsStore {
  return {
    async insert(submission: PropertySubmission) {
      const photoUrls =
        options?.photoUrls ??
        (submission.photos || []).filter((p) => /^https?:\/\//i.test(p))

      const { error } = await supabase.from('property_submissions').insert({
        id: submission.id,
        listing_mode: submission.listingMode,
        category: submission.category,
        area: submission.location,
        rough_address: submission.roughAddress,
        bedrooms: submission.bedrooms ?? null,
        bathrooms: submission.bathrooms ?? null,
        approx_plot_size: submission.approxPlotSize ?? null,
        approx_floor_area: parseFloorArea(submission.approxFloorArea ?? null),
        photo_urls: photoUrls,
        asking_price: submission.askingPrice ?? null,
        contact_name: submission.contactName,
        contact_phone: submission.contactPhone,
        best_time_to_reach: submission.bestTimeToReach,
        status: submission.status || 'new',
        submitted_at: submission.submittedAt,
      })

      if (error) throw new Error(error.message)
    },
  }
}
