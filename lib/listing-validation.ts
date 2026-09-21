/** Shared listing publish rules — safe to import from Next and CF Pages Functions. */

export const MIN_LISTING_IMAGES = 5

export type ListingStatus = 'draft' | 'published'

export function listingImageProgressMessage(count: number): string {
  return `Add at least 5 photos to publish this listing — ${count} of ${MIN_LISTING_IMAGES} added`
}

export function resolveListingStatus(imageCount: number): ListingStatus {
  return imageCount >= MIN_LISTING_IMAGES ? 'published' : 'draft'
}

export function validateListingImages(images: { url?: string; src?: string }[]): {
  ok: boolean
  count: number
  status: ListingStatus
  message: string | null
} {
  const count = images.filter((img) =>
    Boolean(img?.url?.trim() || img?.src?.trim()),
  ).length
  const status = resolveListingStatus(count)
  if (count < MIN_LISTING_IMAGES) {
    return {
      ok: false,
      count,
      status,
      message: listingImageProgressMessage(count),
    }
  }
  return { ok: true, count, status, message: null }
}

/**
 * Server-side publish gate — never trust client validation alone.
 * Saving as draft is allowed with fewer images; publishing is not.
 */
export function assertCanPublish(images: { url?: string; src?: string }[]): {
  allowed: boolean
  status: ListingStatus
  error: string | null
} {
  const result = validateListingImages(images)
  if (!result.ok) {
    return {
      allowed: false,
      status: 'draft',
      error: result.message,
    }
  }
  return { allowed: true, status: 'published', error: null }
}
