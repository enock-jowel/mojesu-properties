import { unstable_cache } from 'next/cache'
import { createClient as createBrowserSupabase } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/admin'
import { SITE_CONTENT_DEFAULTS } from '@/lib/site-content/defaults'
import type {
  AboutContent,
  AreasContent,
  CompanyContent,
  ContactContent,
  FormsContent,
  HomeContent,
  ListWithUsContent,
  NavContent,
  SiteCatalog,
  SiteContentKey,
  SiteContentMap,
  TaxonomyContent,
  ViewingContent,
} from '@/lib/site-content/types'

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createBrowserSupabase(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Pages render per request (CSP nonce), so this read must be cached or every
 * view pays a Supabase round trip per key. Errors throw so they aren't cached.
 */
const cachedSiteContentRow = /* @__PURE__ */ unstable_cache(
  async (key: SiteContentKey): Promise<unknown> => {
    const supabase = anonClient()
    if (!supabase) return null
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('key', key)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data?.data ?? null
  },
  ['site-content-row-v1'],
  { revalidate: 60, tags: ['site-content'] },
)

async function fetchKey<K extends SiteContentKey>(
  key: K,
): Promise<SiteContentMap[K]> {
  const fallback = SITE_CONTENT_DEFAULTS[key]
  try {
    const raw = await cachedSiteContentRow(key)
    if (!raw) return fallback
    return deepMerge(fallback, raw as Partial<SiteContentMap[K]>)
  } catch {
    return fallback
  }
}

export async function getCompanyContent(): Promise<CompanyContent> {
  return fetchKey('company')
}

export async function getContactContent(): Promise<ContactContent> {
  return fetchKey('contact')
}

export async function getAboutContent(): Promise<AboutContent> {
  return fetchKey('about')
}

export async function getListWithUsContent(): Promise<ListWithUsContent> {
  return fetchKey('list_with_us')
}

export async function getHomeContent(): Promise<HomeContent> {
  return fetchKey('home')
}

export async function getTaxonomyContent(): Promise<TaxonomyContent> {
  return fetchKey('taxonomy')
}

export async function getAreasContent(): Promise<AreasContent> {
  return fetchKey('areas')
}

export async function getViewingContent(): Promise<ViewingContent> {
  return fetchKey('viewing')
}

export async function getFormsContent(): Promise<FormsContent> {
  return fetchKey('forms')
}

export async function getNavContent(): Promise<NavContent> {
  return stripAreasNavLinks(await fetchKey('nav'))
}

/** Area guide pages were removed; CMS nav saved earlier may still link to them. */
function stripAreasNavLinks(nav: NavContent): NavContent {
  const keep = (l: { href: string }) => !l.href.startsWith('/areas')
  return {
    ...nav,
    header: nav.header.filter(keep),
    footerMenu: nav.footerMenu.filter(keep),
  }
}

async function loadSiteCatalog(): Promise<SiteCatalog> {
  const [taxonomy, areas, viewing, forms, nav] = await Promise.all([
    getTaxonomyContent(),
    getAreasContent(),
    getViewingContent(),
    getFormsContent(),
    getNavContent(),
  ])
  return { taxonomy, areas, viewing, forms, nav }
}

/** Bundle used by the public SiteCatalogProvider — cached across requests. */
export const getSiteCatalog = unstable_cache(
  loadSiteCatalog,
  ['site-catalog-v1'],
  { revalidate: 60, tags: ['site-content'] },
)

/** Admin / seed — service role, merge with defaults for editors. */
export async function getSiteContentRaw<K extends SiteContentKey>(
  key: K,
): Promise<SiteContentMap[K]> {
  const fallback = SITE_CONTENT_DEFAULTS[key]
  try {
    const admin = createServiceClient()
    const { data } = await admin
      .from('site_content')
      .select('data')
      .eq('key', key)
      .maybeSingle()
    if (!data?.data) return fallback
    return deepMerge(fallback, data.data as Partial<SiteContentMap[K]>)
  } catch {
    return fallback
  }
}

function deepMerge<T extends object>(base: T, patch: Partial<T>): T {
  const out = { ...base }
  for (const [k, v] of Object.entries(patch) as [keyof T, T[keyof T]][]) {
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      typeof out[k] === 'object' &&
      out[k] &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(
        out[k] as object,
        v as object,
      ) as T[keyof T]
    } else if (v !== undefined) {
      out[k] = v
    }
  }
  return out
}

export { phoneHref } from '@/lib/site-content/phone'
