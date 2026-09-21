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

/** null = unset/unreachable; [] = empty published set */
export async function fetchPublishedInsights(): Promise<BlogPost[] | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('insight_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) {
    console.warn('[content] insights fetch failed:', error.message)
    return null
  }
  return ((data || []) as InsightPostRow[]).map(insightRowToPost)
}

export async function fetchPublishedInsightBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('insight_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error || !data) return null
  return insightRowToPost(data as InsightPostRow)
}

export async function fetchPublishedServices(): Promise<ServiceDetail[] | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
  if (error) {
    console.warn('[content] services fetch failed:', error.message)
    return null
  }
  return ((data || []) as ServiceRow[]).map(serviceRowToDetail)
}

export async function fetchPublishedServiceBySlug(
  slug: string,
): Promise<ServiceDetail | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error || !data) return null
  return serviceRowToDetail(data as ServiceRow)
}

export async function fetchPublishedAgents(): Promise<Agent[] | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
  if (error) {
    console.warn('[content] agents fetch failed:', error.message)
    return null
  }
  return ((data || []) as AgentRow[]).map(agentRowToAgent)
}

export async function fetchPublishedReviews(): Promise<Review[] | null> {
  const supabase = anonClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'published')
    .order('review_date', { ascending: false })
  if (error) {
    console.warn('[content] reviews fetch failed:', error.message)
    return null
  }
  return ((data || []) as ReviewRow[]).map(reviewRowToReview)
}
