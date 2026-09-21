/**
 * Blog / insights — public getters read published rows from Supabase only.
 * Seed catalog: scripts/seed-data/blog-catalog.ts
 */

import { fetchPublishedInsightBySlug, fetchPublishedInsights } from '@/lib/content/queries'

export type BlogCategory =
  | 'market-update'
  | 'area-guide'
  | 'buying-guide'
  | 'legal-title'

export type BlogContentBlock =
  | { type: 'lead'; text: string }
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; intro?: string; items: string[]; outro?: string }

export interface BlogPost {
  id: string
  title: string
  /** Short card blurb */
  excerpt: string
  /** Longer subtitle under the H1 on the article page */
  description: string
  coverImage: string
  category: BlogCategory
  readTimeMinutes: number
  publishedAt: string
  slug: string
  content: BlogContentBlock[]
}

export const BLOG_CATEGORY_LABEL: Record<BlogCategory, string> = {
  'market-update': 'Market Update',
  'area-guide': 'Area Guide',
  'buying-guide': 'Buying Guide',
  'legal-title': 'Legal & Title',
}

function sortByPublished(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export async function getBlogPosts(limit = 3): Promise<BlogPost[]> {
  const all = await getAllBlogPosts()
  return all.slice(0, limit)
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const fromDb = await fetchPublishedInsights()
  if (fromDb === null) return []
  return sortByPublished(fromDb)
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const fromDb = await fetchPublishedInsightBySlug(slug)
  if (fromDb) return fromDb
  const fromDbList = await fetchPublishedInsights()
  if (fromDbList === null) return undefined
  return fromDbList.find((p) => p.slug === slug)
}

export async function getRelatedBlogPosts(
  slug: string,
  limit = 3,
): Promise<BlogPost[]> {
  const all = await getAllBlogPosts()
  return all.filter((p) => p.slug !== slug).slice(0, limit)
}
