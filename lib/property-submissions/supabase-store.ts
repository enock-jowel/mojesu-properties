import type { SupabaseClient } from '@supabase/supabase-js'
import type { SubmissionsStore } from './store'
import type { PropertySubmission } from './types'

function parseFloorArea(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(String(raw).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

/**
 * Persist intake photos: keep http(s) URLs; upload data URLs via service role.
 */
export async function persistSubmissionPhotos(
  supabase: SupabaseClient,
  submissionId: string,
  photos: string[],
): Promise<string[]> {
  const out: string[] = []
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]
    if (!photo) continue
    if (/^https?:\/\//i.test(photo)) {
      out.push(photo)
      continue
    }
    if (!photo.startsWith('data:')) continue

    const match = /^data:([^;]+);base64,(.+)$/.exec(photo)
    if (!match) continue
    const contentType = match[1] || 'image/jpeg'
    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
        ? 'webp'
        : 'jpg'
    const bytes = Buffer.from(match[2], 'base64')
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
