import { assertCanPublish } from '@/lib/listing-validation'
import type { ListingWriteInput } from '@/lib/listings/types'

/**
 * Shared publish gate for CMS UI + saveListing.
 * Keep client blockers in lockstep with the server.
 */
export function publishBlocked(input: ListingWriteInput): string | null {
  const gate = assertCanPublish(input.images)
  if (!gate.allowed) return gate.error

  const hasCover = input.images.some((i) => i.is_cover)
  if (!hasCover) return 'Select a cover photo before publishing.'

  if (input.listing_mode === 'sale' && !input.title_status) {
    return 'Title status is required for sale listings.'
  }

  if (!input.title.trim()) return 'Title is required.'
  if (!input.area.trim()) return 'Area is required.'

  if (input.category === 'land') {
    if (!input.plot_dimensions?.trim() && !input.plot_size_total?.trim()) {
      return 'Plot dimensions or total size is required for land.'
    }
    if (!input.title_status) return 'Title status is required for land.'
    if (!input.encumbrances?.trim()) {
      return 'Encumbrances is required (use “None known” if none).'
    }
  }

  if (input.category === 'house' || input.category === 'apartment') {
    if (input.bedrooms == null) return 'Bedrooms is required.'
    if (input.bathrooms == null) return 'Bathrooms is required.'
  }

  if (
    input.category === 'commercial' &&
    input.floor_area == null &&
    input.size_sqm == null
  ) {
    return 'Floor area is required for commercial.'
  }

  return null
}
