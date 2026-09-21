import type { BlogPost } from '@/lib/blog'
import type { Agent } from '@/lib/agents'
import type { Review } from '@/lib/reviews'
import type { ServiceDetail, ServiceId } from '@/lib/services'
import type {
  AgentRow,
  InsightPostRow,
  ReviewRow,
  ServiceRow,
} from '@/lib/content/types'
import { slugifyTitle } from '@/lib/listings/map'

export function insightRowToPost(row: InsightPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    description: row.description,
    coverImage: row.cover_image,
    category: row.category,
    readTimeMinutes: row.read_time_minutes,
    publishedAt: row.published_at || row.created_at.slice(0, 10),
    content: Array.isArray(row.content) ? row.content : [],
  }
}

export function serviceRowToDetail(row: ServiceRow): ServiceDetail {
  return {
    id: row.service_key,
    slug: row.slug,
    name: row.name,
    description: row.description,
    heroDescription: row.hero_description,
    image: row.image,
    imageAlt: row.image_alt,
    iconClass: row.icon_class,
    enquiry: row.enquiry,
    whatWeDo: row.what_we_do,
    offerings: row.offerings,
    process: row.process,
  }
}

export function agentRowToAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    photoUrl: row.photo_url,
    profileHref: row.profile_href || undefined,
    instagramUrl: row.instagram_url || undefined,
    linkedinUrl: row.linkedin_url || undefined,
    phone: row.phone || undefined,
  }
}

export function reviewRowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    authorName: row.author_name,
    role: row.role,
    avatarUrl: row.avatar_url || undefined,
    photoUrl: row.photo_url,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    quote: row.quote,
    relatedTo: row.related_to,
    createdAt: row.review_date,
    featured: row.featured,
  }
}

export function slugifyContentTitle(title: string): string {
  return slugifyTitle(title)
}

export function isServiceId(value: string): value is ServiceId {
  return [
    'property-management',
    'valuation',
    'surveying',
    'agent-search',
    'development',
    'facilities',
  ].includes(value)
}
