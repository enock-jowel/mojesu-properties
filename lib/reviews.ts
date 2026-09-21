/**
 * Client reviews — prefers Google Places when configured, else CMS.
 * UI: components/reviews-section.tsx (unchanged layout).
 */

import { fetchPublishedReviews } from '@/lib/content/queries'
import { fetchGoogleReviews } from '@/lib/google-reviews/fetch'

export type ReviewRelatedTo =
  | 'rental'
  | 'purchase'
  | 'valuation'
  | 'property-management'
  | 'other'

export interface Review {
  id: string
  authorName: string
  /** Role / location line under the name, e.g. "Homebuyer, Ntinda" */
  role: string
  avatarUrl?: string
  /** Large card photo (required for Revalis-style layout) */
  photoUrl: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
  relatedTo: ReviewRelatedTo
  createdAt: string
  /** Featured = dark tall card (left column) */
  featured?: boolean
}

export type ReviewAggregate = {
  average: number
  count: number
}

export type ReviewsPayload = {
  reviews: Review[]
  aggregate: ReviewAggregate | null
  /** Present when reviews came from Google Places */
  source: 'google' | 'cms' | 'none'
  mapsUri: string | null
}

export const REVIEW_RELATED_LABEL: Record<ReviewRelatedTo, string> = {
  rental: 'Rented via platform',
  purchase: 'Bought a home',
  valuation: 'Used Valuation service',
  'property-management': 'Property Management client',
  other: 'Mojesu client',
}

export async function getReviewsPayload(): Promise<ReviewsPayload> {
  const google = await fetchGoogleReviews()
  if (google && google.reviews.length > 0) {
    return {
      reviews: google.reviews,
      aggregate: google.aggregate,
      source: 'google',
      mapsUri: google.mapsUri,
    }
  }

  const fromDb = await fetchPublishedReviews()
  if (fromDb === null || fromDb.length === 0) {
    return { reviews: [], aggregate: null, source: 'none', mapsUri: null }
  }

  const reviews = [...fromDb].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return {
    reviews,
    aggregate: getReviewAggregate(reviews),
    source: 'cms',
    mapsUri: null,
  }
}

export async function getReviews(): Promise<Review[]> {
  const payload = await getReviewsPayload()
  return payload.reviews
}

export function getFeaturedReview(reviews: Review[]): Review | undefined {
  return reviews.find((r) => r.featured) ?? reviews[0]
}

export function getReviewAggregate(reviews: Review[]): ReviewAggregate | null {
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  }
}
