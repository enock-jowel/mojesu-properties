import { ListingsTable } from '@/components/admin/listings-table'
import { getAdminListings } from '@/lib/listings/actions'
import type { CmsCategory, CmsStatus } from '@/lib/listings/types'

export const metadata = {
  title: 'Listings — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const STATUSES: CmsStatus[] = ['draft', 'published', 'archived']
const CATEGORIES: CmsCategory[] = [
  'house',
  'apartment',
  'land',
  'commercial',
]
const MODES = ['rent', 'sale'] as const

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    category?: string
    mode?: string
    area?: string
  }>
}) {
  const sp = await searchParams
  const result = await getAdminListings()

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load listings: {result.error}
      </div>
    )
  }

  const initialStatus = STATUSES.includes(sp.status as CmsStatus)
    ? (sp.status as CmsStatus)
    : 'all'
  const initialCategory = CATEGORIES.includes(sp.category as CmsCategory)
    ? (sp.category as CmsCategory)
    : 'all'
  const initialMode = MODES.includes(sp.mode as (typeof MODES)[number])
    ? (sp.mode as 'rent' | 'sale')
    : 'all'
  const initialArea = sp.area?.trim() || 'all'

  return (
    <ListingsTable
      listings={result.data}
      initialStatus={initialStatus}
      initialCategory={initialCategory}
      initialMode={initialMode}
      initialArea={initialArea}
    />
  )
}
