import { unstable_cache } from 'next/cache'
import { createClient as createBrowserSupabase } from '@supabase/supabase-js'
import {
  agentRowToAgent,
  insightRowToPost,
  reviewRowToReview,
  serviceRowToDetail,
} from '@/lib/content/map'
import type {
  AgentRow,
  InsightPostRow,
  ReviewRow,
  ServiceRow,
} from '@/lib/content/types'
import type { BlogPost } from '@/lib/blog'
import type { Agent } from '@/lib/agents'
import type { Review } from '@/lib/reviews'
import type { ServiceDetail } from '@/lib/services'

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createBrowserSupabase(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Invalidated by `revalidateTag` in lib/content/actions.ts. */
export const CONTENT_CACHE_TAG = 'content'
const CACHE = { revalidate: 60, tags: [CONTENT_CACHE_TAG] }

/**
 * Pages render per request (CSP nonce), so uncached Supabase reads cost a
 * cross-region round trip on every view. Errors throw inside the cache so a
 * failed read is never stored; callers get `null` as before.
 */
async function uncachedOnError<T>(
  label: string,
  load: () => Promise<T>,
): Promise<T | null> {
  try {
    return await load()
  } catch (e) {
    console.warn(`[content] ${label} fetch failed:`, e instanceof Error ? e.message : e)
    return null
  }
}

async function publishedRows<R>(
  table: string,
  orderBy: string,
  ascending: boolean,
): Promise<R[] | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('status', 'published')
    .order(orderBy, { ascending })
  if (error) throw new Error(error.message)
  return (data || []) as R[]
}

async function publishedRowBySlug<R>(table: string, slug: string): Promise<R | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as R) ?? null
}

const cachedInsights = /* @__PURE__ */ unstable_cache(
  async () => {
    const rows = await publishedRows<InsightPostRow>('insight_posts', 'published_at', false)
    return rows ? rows.map(insightRowToPost) : null
  },
  ['published-insights-v1'],
  CACHE,
)

const cachedInsightBySlug = /* @__PURE__ */ unstable_cache(
  async (slug: string) => {
    const row = await publishedRowBySlug<InsightPostRow>('insight_posts', slug)
    return row ? insightRowToPost(row) : null
  },
  ['published-insight-by-slug-v1'],
  CACHE,
)

const cachedServices = /* @__PURE__ */ unstable_cache(
  async () => {
    const rows = await publishedRows<ServiceRow>('services', 'sort_order', true)
    return rows ? rows.map(serviceRowToDetail) : null
  },
  ['published-services-v1'],
  CACHE,
)

const cachedServiceBySlug = /* @__PURE__ */ unstable_cache(
  async (slug: string) => {
    const row = await publishedRowBySlug<ServiceRow>('services', slug)
    return row ? serviceRowToDetail(row) : null
  },
  ['published-service-by-slug-v1'],
  CACHE,
)

const cachedAgents = /* @__PURE__ */ unstable_cache(
  async () => {
    const rows = await publishedRows<AgentRow>('agents', 'sort_order', true)
    return rows ? rows.map(agentRowToAgent) : null
  },
  ['published-agents-v1'],
  CACHE,
)

const cachedReviews = /* @__PURE__ */ unstable_cache(
  async () => {
    const rows = await publishedRows<ReviewRow>('reviews', 'review_date', false)
    return rows ? rows.map(reviewRowToReview) : null
  },
  ['published-reviews-v1'],
  CACHE,
)

/** null = unset/unreachable; [] = empty published set */
export async function fetchPublishedInsights(): Promise<BlogPost[] | null> {
  return uncachedOnError('insights', cachedInsights)
}

export async function fetchPublishedInsightBySlug(
  slug: string,
): Promise<BlogPost | null> {
  return uncachedOnError('insight', () => cachedInsightBySlug(slug))
}

export async function fetchPublishedServices(): Promise<ServiceDetail[] | null> {
  return uncachedOnError('services', cachedServices)
}

export async function fetchPublishedServiceBySlug(
  slug: string,
): Promise<ServiceDetail | null> {
  return uncachedOnError('service', () => cachedServiceBySlug(slug))
}

export async function fetchPublishedAgents(): Promise<Agent[] | null> {
  return uncachedOnError('agents', cachedAgents)
}

export async function fetchPublishedReviews(): Promise<Review[] | null> {
  return uncachedOnError('reviews', cachedReviews)
}
