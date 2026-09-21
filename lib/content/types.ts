import type { BlogCategory, BlogContentBlock } from '@/lib/blog'
import type {
  ServiceEnquiryConfig,
  ServiceId,
  ServiceOfferingItem,
  ServiceProcessStep,
} from '@/lib/services'
import type { ReviewRelatedTo } from '@/lib/reviews'

export type ContentStatus = 'draft' | 'published'

export type InsightPostRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  cover_image: string
  category: BlogCategory
  read_time_minutes: number
  content: BlogContentBlock[]
  status: ContentStatus
  published_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type ServiceRow = {
  id: string
  service_key: ServiceId
  slug: string
  name: string
  description: string
  hero_description: string
  image: string
  image_alt: string
  icon_class: string
  enquiry: ServiceEnquiryConfig
  what_we_do: {
    title: string
    body: string
    image: string
    imageAlt: string
  }
  offerings: {
    title: string
    body: string
    items: ServiceOfferingItem[]
  }
  process: {
    title: string
    body: string
    image: string
    imageAlt: string
    steps: ServiceProcessStep[]
  }
  status: ContentStatus
  sort_order: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type AgentRow = {
  id: string
  name: string
  role: string
  photo_url: string
  profile_href: string | null
  instagram_url: string | null
  linkedin_url: string | null
  phone: string | null
  status: ContentStatus
  sort_order: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type ReviewRow = {
  id: string
  author_name: string
  role: string
  avatar_url: string | null
  photo_url: string
  rating: number
  quote: string
  related_to: ReviewRelatedTo
  featured: boolean
  status: ContentStatus
  review_date: string
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type InsightWriteInput = {
  slug: string
  title: string
  excerpt: string
  description: string
  cover_image: string
  category: BlogCategory
  read_time_minutes: number
  content: BlogContentBlock[]
  status: ContentStatus
  published_at?: string | null
}

export type ServiceWriteInput = {
  service_key: ServiceId
  slug: string
  name: string
  description: string
  hero_description: string
  image: string
  image_alt: string
  icon_class: string
  enquiry: ServiceEnquiryConfig
  what_we_do: ServiceRow['what_we_do']
  offerings: ServiceRow['offerings']
  process: ServiceRow['process']
  status: ContentStatus
  sort_order: number
}

export type AgentWriteInput = {
  name: string
  role: string
  photo_url: string
  profile_href?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
  phone?: string | null
  status: ContentStatus
  sort_order: number
}

export type ReviewWriteInput = {
  author_name: string
  role: string
  avatar_url?: string | null
  photo_url: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
  related_to: ReviewRelatedTo
  featured: boolean
  status: ContentStatus
  review_date: string
}
