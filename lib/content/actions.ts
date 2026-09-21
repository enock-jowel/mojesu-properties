'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff, type ActionResult } from '@/lib/admin/auth'
import type {
  AgentRow,
  AgentWriteInput,
  InsightPostRow,
  InsightWriteInput,
  ReviewRow,
  ReviewWriteInput,
  ServiceRow,
  ServiceWriteInput,
} from '@/lib/content/types'

function revalidateContent(paths: string[] = []) {
  revalidatePath('/')
  revalidatePath('/insights/')
  revalidatePath('/services/')
  revalidatePath('/about/')
  revalidatePath('/admin/content/')
  for (const p of paths) revalidatePath(p)
}

/* ─── Insights ─────────────────────────────────────────────── */

export async function getAdminInsights(): Promise<ActionResult<InsightPostRow[]>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('insight_posts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as InsightPostRow[] }
}

export async function getAdminInsight(
  id: string,
): Promise<ActionResult<InsightPostRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('insight_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return { ok: false, error: error?.message || 'Not found' }
  return { ok: true, data: data as InsightPostRow }
}

export async function saveInsight(
  input: InsightWriteInput,
  id?: string,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  if (!input.title.trim() || !input.slug.trim()) {
    return { ok: false, error: 'Title and slug are required.' }
  }
  if (input.status === 'published' && !input.content?.length) {
    return { ok: false, error: 'Add at least one content block before publishing.' }
  }
  if (input.status === 'published' && !input.cover_image.trim()) {
    return { ok: false, error: 'Cover image is required to publish.' }
  }

  const base = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    description: input.description.trim(),
    cover_image: input.cover_image.trim(),
    category: input.category,
    read_time_minutes: input.read_time_minutes || 5,
    content: input.content || [],
    status: input.status,
    published_at:
      input.status === 'published'
        ? input.published_at || new Date().toISOString().slice(0, 10)
        : input.published_at || null,
    updated_at: new Date().toISOString(),
    updated_by: gate.user.id,
  }

  if (id) {
    const { data, error } = await gate.supabase
      .from('insight_posts')
      .update(base)
      .eq('id', id)
      .select('id, slug')
      .single()
    if (error || !data) return { ok: false, error: error?.message || 'Update failed' }
    revalidateContent([`/insights/${data.slug}/`, '/admin/content/insights/'])
    return { ok: true, data }
  }

  const { data, error } = await gate.supabase
    .from('insight_posts')
    .insert({ ...base, created_by: gate.user.id })
    .select('id, slug')
    .single()
  if (error || !data) {
    if (error?.code === '23505') {
      return { ok: false, error: 'An insight with this slug already exists.' }
    }
    return { ok: false, error: error?.message || 'Create failed' }
  }
  revalidateContent([`/insights/${data.slug}/`, '/admin/content/insights/'])
  return { ok: true, data }
}

export async function deleteInsight(id: string): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { error } = await gate.supabase.from('insight_posts').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateContent(['/admin/content/insights/'])
  return { ok: true, data: undefined }
}

/* ─── Services ─────────────────────────────────────────────── */

export async function getAdminServices(): Promise<ActionResult<ServiceRow[]>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as ServiceRow[] }
}

export async function getAdminService(
  id: string,
): Promise<ActionResult<ServiceRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return { ok: false, error: error?.message || 'Not found' }
  return { ok: true, data: data as ServiceRow }
}

export async function saveService(
  input: ServiceWriteInput,
  id?: string,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  if (!input.name.trim() || !input.slug.trim() || !input.service_key) {
    return { ok: false, error: 'Name, slug, and service key are required.' }
  }

  const base = {
    service_key: input.service_key,
    slug: input.slug.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    hero_description: input.hero_description.trim(),
    image: input.image.trim(),
    image_alt: input.image_alt.trim(),
    icon_class: input.icon_class.trim() || 'fi fi-sr-building',
    enquiry: input.enquiry,
    what_we_do: input.what_we_do,
    offerings: input.offerings,
    process: input.process,
    status: input.status,
    sort_order: input.sort_order ?? 0,
    updated_at: new Date().toISOString(),
    updated_by: gate.user.id,
  }

  if (id) {
    const { data, error } = await gate.supabase
      .from('services')
      .update(base)
      .eq('id', id)
      .select('id, slug')
      .single()
    if (error || !data) return { ok: false, error: error?.message || 'Update failed' }
    revalidateContent([`/services/${data.slug}/`, '/admin/content/services/'])
    return { ok: true, data }
  }

  const { data, error } = await gate.supabase
    .from('services')
    .insert({ ...base, created_by: gate.user.id })
    .select('id, slug')
    .single()
  if (error || !data) {
    if (error?.code === '23505') {
      return { ok: false, error: 'Slug or service key already exists.' }
    }
    return { ok: false, error: error?.message || 'Create failed' }
  }
  revalidateContent([`/services/${data.slug}/`, '/admin/content/services/'])
  return { ok: true, data }
}

export async function deleteService(id: string): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { error } = await gate.supabase.from('services').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateContent(['/admin/content/services/'])
  return { ok: true, data: undefined }
}

/* ─── Agents ───────────────────────────────────────────────── */

export async function getAdminAgents(): Promise<ActionResult<AgentRow[]>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('agents')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as AgentRow[] }
}

export async function getAdminAgent(
  id: string,
): Promise<ActionResult<AgentRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return { ok: false, error: error?.message || 'Not found' }
  return { ok: true, data: data as AgentRow }
}

export async function saveAgent(
  input: AgentWriteInput,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  if (!input.name.trim() || !input.photo_url.trim()) {
    return { ok: false, error: 'Name and photo are required.' }
  }

  const base = {
    name: input.name.trim(),
    role: input.role.trim(),
    photo_url: input.photo_url.trim(),
    profile_href: input.profile_href?.trim() || null,
    instagram_url: input.instagram_url?.trim() || null,
    linkedin_url: input.linkedin_url?.trim() || null,
    phone: input.phone?.trim() || null,
    status: input.status,
    sort_order: input.sort_order ?? 0,
    updated_at: new Date().toISOString(),
    updated_by: gate.user.id,
  }

  if (id) {
    const { data, error } = await gate.supabase
      .from('agents')
      .update(base)
      .eq('id', id)
      .select('id')
      .single()
    if (error || !data) return { ok: false, error: error?.message || 'Update failed' }
    revalidateContent(['/admin/content/agents/', '/about/'])
    return { ok: true, data }
  }

  const { data, error } = await gate.supabase
    .from('agents')
    .insert({ ...base, created_by: gate.user.id })
    .select('id')
    .single()
  if (error || !data) return { ok: false, error: error?.message || 'Create failed' }
  revalidateContent(['/admin/content/agents/', '/about/'])
  return { ok: true, data }
}

export async function deleteAgent(id: string): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { error } = await gate.supabase.from('agents').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateContent(['/admin/content/agents/', '/about/'])
  return { ok: true, data: undefined }
}

/* ─── Reviews ──────────────────────────────────────────────── */

export async function getAdminReviews(): Promise<ActionResult<ReviewRow[]>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('reviews')
    .select('*')
    .order('review_date', { ascending: false })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data || []) as ReviewRow[] }
}

export async function getAdminReview(
  id: string,
): Promise<ActionResult<ReviewRow>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { data, error } = await gate.supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return { ok: false, error: error?.message || 'Not found' }
  return { ok: true, data: data as ReviewRow }
}

export async function saveReview(
  input: ReviewWriteInput,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  if (!input.author_name.trim() || !input.quote.trim() || !input.photo_url.trim()) {
    return { ok: false, error: 'Author, quote, and photo are required.' }
  }

  const base = {
    author_name: input.author_name.trim(),
    role: input.role.trim(),
    avatar_url: input.avatar_url?.trim() || null,
    photo_url: input.photo_url.trim(),
    rating: input.rating,
    quote: input.quote.trim(),
    related_to: input.related_to,
    featured: Boolean(input.featured),
    status: input.status,
    review_date: input.review_date || new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
    updated_by: gate.user.id,
  }

  if (id) {
    const { data, error } = await gate.supabase
      .from('reviews')
      .update(base)
      .eq('id', id)
      .select('id')
      .single()
    if (error || !data) return { ok: false, error: error?.message || 'Update failed' }
    revalidateContent(['/admin/content/reviews/'])
    return { ok: true, data }
  }

  const { data, error } = await gate.supabase
    .from('reviews')
    .insert({ ...base, created_by: gate.user.id })
    .select('id')
    .single()
  if (error || !data) return { ok: false, error: error?.message || 'Create failed' }
  revalidateContent(['/admin/content/reviews/'])
  return { ok: true, data }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  const { error } = await gate.supabase.from('reviews').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateContent(['/admin/content/reviews/'])
  return { ok: true, data: undefined }
}
