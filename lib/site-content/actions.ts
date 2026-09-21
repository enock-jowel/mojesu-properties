'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireStaff, type ActionResult } from '@/lib/admin/auth'
import type { SiteContentKey, SiteContentMap } from '@/lib/site-content/types'
import { getSiteContentRaw } from '@/lib/site-content/queries'

const ADMIN_PATH: Partial<Record<SiteContentKey, string>> = {
  company: '/admin/content/site/company/',
  about: '/admin/content/site/about/',
  list_with_us: '/admin/content/site/list-with-us/',
  home: '/admin/content/site/home/',
  taxonomy: '/admin/content/site/taxonomy/',
  areas: '/admin/content/site/areas/',
  viewing: '/admin/content/site/viewing/',
  forms: '/admin/content/site/forms/',
  nav: '/admin/content/site/nav/',
}

function revalidateSite() {
  revalidatePath('/')
  revalidatePath('/about/')
  revalidatePath('/list-with-us/')
  revalidatePath('/services/')
  revalidatePath('/insights/')
  revalidatePath('/rent/')
  revalidatePath('/buy/')
  revalidatePath('/land/')
  revalidatePath('/admin/content/')
  revalidatePath('/listings/', 'layout')
}

export async function getAdminSiteContent<K extends SiteContentKey>(
  key: K,
): Promise<ActionResult<SiteContentMap[K]>> {
  const gate = await requireStaff()
  if (gate.error) return { ok: false, error: gate.error }
  return { ok: true, data: await getSiteContentRaw(key) }
}

export async function saveSiteContent<K extends SiteContentKey>(
  key: K,
  data: SiteContentMap[K],
): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }

  const { error } = await gate.supabase.from('site_content').upsert(
    {
      key,
      data,
      updated_by: gate.user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) return { ok: false, error: error.message }
  revalidateTag('site-content')
  revalidateSite()
  const adminPath = ADMIN_PATH[key]
  if (adminPath) revalidatePath(adminPath)
  return { ok: true, data: undefined }
}
