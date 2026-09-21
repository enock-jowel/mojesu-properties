/**
 * Admin dashboard aggregates — lean selects + head counts (service role).
 * Cached 3 minutes via unstable_cache; gated by requireStaff at the page layer.
 */
import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/admin'
import { DEFAULT_VIEWING } from '@/lib/site-content/catalog-defaults'
import { MIN_LISTING_IMAGES } from '@/lib/listing-validation'
import type {
  CountRow,
  DashboardSnapshot,
  IncompleteListing,
  SparkPoint,
  StaffAction,
  StaffLogin,
  TopBookedListing,
} from '@/lib/dashboard/types'

export const DASHBOARD_CACHE_SECONDS = 180

const CATEGORY_LABEL: Record<string, string> = {
  house: 'House (residential)',
  apartment: 'Apartment (residential)',
  land: 'Land',
  commercial: 'Commercial',
}

const MODE_LABEL: Record<string, string> = {
  sale: 'For sale',
  rent: 'For rent',
}

function startOfWeek(d = new Date()): Date {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? 6 : day - 1
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - diff)
  return x
}

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function weekKey(d: Date): string {
  const s = startOfWeek(d)
  return s.toISOString().slice(0, 10)
}

function countBy<T>(
  rows: T[],
  keyFn: (row: T) => string | null | undefined,
): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const key = keyFn(row)
    if (!key) continue
    map.set(key, (map.get(key) || 0) + 1)
  }
  return map
}

function inRange(
  isoDate: string | null | undefined,
  from: string | null,
  to: string | null,
) {
  if (!isoDate) return false
  const day = isoDate.slice(0, 10)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

async function countListingsByStatus(
  status: 'published' | 'draft' | 'archived',
): Promise<number> {
  const sb = createServiceClient()
  const { count, error } = await sb
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', status)
  if (error) {
    throw new Error(
      `Listings count (${status}): ${error.message || 'query failed'}`,
    )
  }
  return count ?? 0
}

async function fetchFeeUgx(): Promise<number> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('site_content')
    .select('data')
    .eq('key', 'viewing')
    .maybeSingle()
  const fee = (data?.data as { feeUgx?: number } | null)?.feeUgx
  return typeof fee === 'number' && fee > 0 ? fee : DEFAULT_VIEWING.feeUgx
}

/** Uncached aggregate builder (also used by the Next.js cache wrapper). */
export async function buildDashboardSnapshot(range?: {
  from?: string | null
  to?: string | null
}): Promise<DashboardSnapshot> {
  const sb = createServiceClient()
  const dateFrom = range?.from || null
  const dateTo = range?.to || null

  const weekStart = startOfWeek()
  const monthStart = startOfMonth()
  const trendStart = new Date()
  trendStart.setDate(trendStart.getDate() - 7 * 7)

  const [
    publishedCount,
    draftCount,
    archivedCount,
    feeUgx,
    listingLean,
    bookingLean,
    submissionLean,
    draftImages,
    profiles,
    authUsersResult,
  ] = await Promise.all([
    countListingsByStatus('published'),
    countListingsByStatus('draft'),
    countListingsByStatus('archived'),
    fetchFeeUgx(),
    sb
      .from('listings')
      .select(
        'id, title, slug, status, category, listing_mode, area, created_at, updated_at, created_by, updated_by',
      )
      .order('updated_at', { ascending: false }),
    sb
      .from('viewing_bookings')
      .select('id, status, listing_ids, requested_at, confirmed_at'),
    sb
      .from('property_submissions')
      .select('id, status, submitted_at, area, category'),
    sb
      .from('listings')
      .select('id, title, slug, listing_images ( id )')
      .eq('status', 'draft'),
    sb.from('profiles').select('id, full_name, role, created_at'),
    sb.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ])

  if (listingLean.error) {
    throw new Error(`Listings query: ${listingLean.error.message}`)
  }
  if (bookingLean.error) {
    throw new Error(`Viewing bookings query: ${bookingLean.error.message}`)
  }
  if (submissionLean.error) {
    throw new Error(
      `Property submissions query: ${submissionLean.error.message}`,
    )
  }
  if (draftImages.error) {
    throw new Error(`Draft images query: ${draftImages.error.message}`)
  }
  if (profiles.error) {
    throw new Error(`Profiles query: ${profiles.error.message}`)
  }

  const listings = listingLean.data || []
  const bookings = bookingLean.data || []
  const submissions = submissionLean.data || []
  const nameById = new Map(
    (profiles.data || []).map((p) => [
      p.id as string,
      (p.full_name as string | null) || 'Staff',
    ]),
  )

  const newThisWeek = listings.filter(
    (l) => l.created_at && new Date(l.created_at) >= weekStart,
  ).length
  const newThisMonth = listings.filter(
    (l) => l.created_at && new Date(l.created_at) >= monthStart,
  ).length

  const trendBuckets = new Map<string, number>()
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    trendBuckets.set(weekKey(d), 0)
  }
  for (const l of listings) {
    if (!l.created_at) continue
    const created = new Date(l.created_at)
    if (created < trendStart) continue
    const key = weekKey(created)
    if (trendBuckets.has(key)) {
      trendBuckets.set(key, (trendBuckets.get(key) || 0) + 1)
    }
  }
  const createdTrend: SparkPoint[] = [...trendBuckets.entries()].map(
    ([label, count]) => ({ label, count }),
  )

  const byCategoryMap = countBy(
    listings.filter((l) => l.status === 'published'),
    (l) => l.category as string,
  )
  const byCategory: CountRow[] = [
    'house',
    'apartment',
    'land',
    'commercial',
  ].map((key) => ({
    key,
    label: CATEGORY_LABEL[key] || key,
    count: byCategoryMap.get(key) || 0,
    href: `/admin/listings/?status=published&category=${key}`,
  }))

  const byModeMap = countBy(
    listings.filter((l) => l.status === 'published'),
    (l) => l.listing_mode as string,
  )
  const byMode: CountRow[] = ['sale', 'rent'].map((key) => ({
    key,
    label: MODE_LABEL[key] || key,
    count: byModeMap.get(key) || 0,
    href: `/admin/listings/?status=published&mode=${key}`,
  }))

  const areaMap = countBy(
    listings.filter((l) => l.status === 'published'),
    (l) => (l.area as string)?.trim() || null,
  )
  const topAreas: CountRow[] = [...areaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({
      key,
      label: key,
      count,
      href: `/admin/listings/?status=published&area=${encodeURIComponent(key)}`,
    }))

  const incomplete: IncompleteListing[] = (draftImages.data || [])
    .map((row) => {
      const imageCount = Array.isArray(row.listing_images)
        ? row.listing_images.length
        : 0
      return {
        id: row.id as string,
        title: (row.title as string) || 'Untitled',
        slug: (row.slug as string) || '',
        imageCount,
        href: `/admin/listings/${row.id}/edit/`,
      }
    })
    .filter((r) => r.imageCount < MIN_LISTING_IMAGES)
    .sort((a, b) => a.imageCount - b.imageCount)
    .slice(0, 10)

  const submissionsInRange = submissions.filter((s) =>
    inRange(s.submitted_at as string, dateFrom, dateTo),
  )
  const bookingsInRange = bookings.filter((b) =>
    inRange(b.requested_at as string, dateFrom, dateTo),
  )

  const subStatusMap = countBy(submissionsInRange, (s) => s.status as string)
  const submissionStatus: CountRow[] = [
    'new',
    'contacted',
    'visited',
    'listed',
    'declined',
  ].map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    count: subStatusMap.get(key) || 0,
    href: `/admin/requests/?tab=submissions`,
  }))

  const bookingStatusMap = countBy(bookings, (b) => b.status as string)
  const viewingByStatus: CountRow[] = [
    'requested',
    'confirmed',
    'completed',
    'expired',
    'declined',
  ].map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    count: bookingStatusMap.get(key) || 0,
    href: `/admin/requests/?tab=bookings`,
  }))

  const confirmedOrCompleted = bookings.filter((b) =>
    ['confirmed', 'completed'].includes(b.status as string),
  ).length
  const bookedThisWeek = bookings.filter(
    (b) => b.requested_at && new Date(b.requested_at as string) >= weekStart,
  ).length
  const bookedThisMonth = bookings.filter(
    (b) => b.requested_at && new Date(b.requested_at as string) >= monthStart,
  ).length
  const estimatedRevenueUgx = confirmedOrCompleted * feeUgx

  const bookingCountByListing = new Map<string, number>()
  for (const b of bookings) {
    const ids = (b.listing_ids as string[] | null) || []
    for (const id of ids) {
      bookingCountByListing.set(id, (bookingCountByListing.get(id) || 0) + 1)
    }
  }
  const topListingIds = [...bookingCountByListing.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const listingMeta = new Map(
    listings.map((l) => [
      l.id as string,
      { title: l.title as string, slug: l.slug as string },
    ]),
  )
  const topProperties: TopBookedListing[] = topListingIds.map(([id, count]) => {
    const meta = listingMeta.get(id)
    return {
      listingId: id,
      title: meta?.title || `Listing ${id.slice(0, 8)}…`,
      slug: meta?.slug || null,
      bookingCount: count,
      href: meta ? `/admin/listings/${id}/edit/` : null,
    }
  })

  const recentActions: StaffAction[] = []
  for (const l of listings.slice(0, 40)) {
    const updatedBy = l.updated_by as string | null
    const createdBy = l.created_by as string | null
    const createdAt = l.created_at as string
    const updatedAt = l.updated_at as string
    const sameSecond =
      createdAt &&
      updatedAt &&
      createdAt.slice(0, 19) === updatedAt.slice(0, 19)

    if (sameSecond || !updatedBy || updatedBy === createdBy) {
      recentActions.push({
        listingId: l.id as string,
        title: (l.title as string) || 'Untitled',
        action: l.status === 'published' ? 'published' : 'created',
        at: createdAt,
        actorId: createdBy,
        actorName: createdBy
          ? nameById.get(createdBy) || 'Staff'
          : 'Unknown',
        href: `/admin/listings/${l.id}/edit/`,
      })
    } else {
      recentActions.push({
        listingId: l.id as string,
        title: (l.title as string) || 'Untitled',
        action: 'edited',
        at: updatedAt,
        actorId: updatedBy,
        actorName: updatedBy
          ? nameById.get(updatedBy) || 'Staff'
          : 'Unknown',
        href: `/admin/listings/${l.id}/edit/`,
      })
    }
    if (recentActions.length >= 12) break
  }
  recentActions.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )

  const staffProfiles = (profiles.data || []).filter((p) =>
    ['admin', 'staff'].includes(p.role as string),
  )
  const adminCount = staffProfiles.filter((p) => p.role === 'admin').length
  const staffCount = staffProfiles.filter((p) => p.role === 'staff').length

  if (authUsersResult.error) {
    throw new Error(
      `Auth users query: ${authUsersResult.error.message || 'listUsers failed'}`,
    )
  }

  const authUsers = authUsersResult.data?.users || []
  const emailById = new Map(authUsers.map((u) => [u.id, u.email || '']))
  const lastSignInById = new Map(
    authUsers.map((u) => [u.id, u.last_sign_in_at || null]),
  )

  const logins: StaffLogin[] = staffProfiles
    .map((p) => ({
      id: p.id as string,
      fullName: (p.full_name as string | null) ?? null,
      email: emailById.get(p.id as string) || '',
      role: p.role as 'admin' | 'staff',
      lastSignInAt: lastSignInById.get(p.id as string) || null,
    }))
    .sort((a, b) => {
      const ta = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0
      const tb = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0
      return tb - ta
    })

  const totalLeadsTracked =
    dateFrom || dateTo
      ? submissionsInRange.length + bookingsInRange.length
      : submissions.length + bookings.length

  return {
    generatedAt: new Date().toISOString(),
    cacheSeconds: DASHBOARD_CACHE_SECONDS,

    summary: {
      activeListings: publishedCount,
      draftListings: draftCount,
      archivedListings: archivedCount,
      totalLeadsTracked,
      viewingBookingsTotal: bookings.length,
      estimatedPassRevenueUgx: estimatedRevenueUgx,
      revenueNote:
        'Estimate: confirmed+completed bookings × CMS viewing fee (no payment ledger).',
    },

    listings: {
      byStatus: [
        {
          key: 'published',
          label: 'Active (published)',
          count: publishedCount,
          href: '/admin/listings/?status=published',
        },
        {
          key: 'draft',
          label: 'Draft',
          count: draftCount,
          href: '/admin/listings/?status=draft',
        },
        {
          key: 'archived',
          label: 'Archived',
          count: archivedCount,
          href: '/admin/listings/?status=archived',
        },
      ],
      byCategory,
      byMode,
      categorySchemaNote:
        'Schema categories are house, apartment, land, commercial. Industrial / mixed-use are not stored yet.',
      modeSchemaNote:
        'Schema modes are rent and sale only. Lease, short-let, off-plan, rent-to-own are not stored yet.',
      topAreas,
      newThisWeek,
      newThisMonth,
      createdTrend,
      incomplete,
      incompleteNote:
        'No dedicated “incomplete” status. Flagged as drafts with fewer than 5 images (publish rule).',
    },

    leads: {
      dateFrom,
      dateTo,
      submissionsTotal: submissions.length,
      submissionsInRange: submissionsInRange.length,
      bookingsAsLeadsInRange: bookingsInRange.length,
      submissionStatus,
      sources: [
        {
          key: 'list-with-us',
          label: 'List with us form',
          count:
            dateFrom || dateTo
              ? submissionsInRange.length
              : submissions.length,
          href: '/admin/requests/?tab=submissions',
        },
        {
          key: 'viewing-bookings',
          label: 'Viewing pass bookings',
          count:
            dateFrom || dateTo ? bookingsInRange.length : bookings.length,
          href: '/admin/requests/?tab=bookings',
        },
      ],
      gaps: [
        {
          title: 'Contact form enquiries',
          reason:
            'Contact form is a UI stub (fake success) — nothing is written to Supabase.',
          needs: [
            'Table e.g. contact_enquiries (name, email, phone, message, status, source_path, created_at)',
            'POST handler / API route that inserts rows (replace localStorage/fake success)',
            'Optional status column: new | contacted | converted | closed',
          ],
        },
        {
          title: 'Service enquiry form',
          reason:
            'Service enquiry form is a UI stub — enquiry config exists on services, submissions do not.',
          needs: [
            'Table e.g. service_enquiries (service_id, contact fields, status, created_at)',
            'Wire components/service-enquiry-form.tsx to persist',
          ],
        },
        {
          title: 'Failed / undelivered enquiry logging',
          reason:
            'No error/delivery log table for contact or service endpoints.',
          needs: [
            'Table e.g. form_submission_errors (form, payload_summary, error, created_at)',
            'Log failures in the future API handlers',
          ],
        },
        {
          title: 'Unified lead status (new → closed)',
          reason:
            'Only property_submissions have a status funnel. Contact/service leads have no rows. Viewing bookings use a separate status enum.',
          needs: [
            'Either unify leads into one table with source + status, or add status to each lead type and aggregate here',
          ],
        },
      ],
    },

    viewings: {
      totalBookings: bookings.length,
      confirmedOrCompleted,
      bookedThisWeek,
      bookedThisMonth,
      feeUgx,
      estimatedRevenueUgx,
      revenueIsEstimate: true,
      topProperties,
      byStatus: viewingByStatus,
    },

    staff: {
      adminCount,
      staffCount,
      authUserCount: authUsers.length,
      authUserNote:
        'Auth users are staff accounts today — there is no separate public end-user registry.',
      recentActions,
      logins,
      gaps: [
        {
          title: 'Dedicated audit / activity log',
          reason:
            'Recent actions are inferred from listings.created_by / updated_by / timestamps — not a full audit trail.',
          needs: [
            'Table e.g. staff_activity (actor_id, action, entity_type, entity_id, created_at, meta jsonb)',
            'Write events on listing save, publish, request status changes',
          ],
        },
      ],
    },

    performance: {
      gaps: [
        {
          title: 'Page views & traffic sources',
          reason:
            'No page_views table, Cloudflare Analytics binding, or client analytics SDK in the app.',
          needs: [
            'Cloudflare Web Analytics / Analytics Engine binding, or',
            'Table page_views (path, listing_id, referrer, created_at) + lightweight beacon',
            'Then wire Top 5 listing pages and weekly views here',
          ],
        },
      ],
    },
  }
}

const getCachedDashboard = unstable_cache(
  async (from: string, to: string) =>
    buildDashboardSnapshot({
      from: from || null,
      to: to || null,
    }),
  ['admin-dashboard-v1'],
  { revalidate: DASHBOARD_CACHE_SECONDS, tags: ['admin-dashboard'] },
)

/** Staff-gated entry — call from server pages only. */
export async function getDashboardSnapshot(opts?: {
  from?: string | null
  to?: string | null
}): Promise<
  | { ok: true; data: DashboardSnapshot }
  | { ok: false; error: string }
> {
  const from = opts?.from?.trim() || ''
  const to = opts?.to?.trim() || ''
  try {
    const data = await getCachedDashboard(from, to)
    return { ok: true, data }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Dashboard query failed'
    console.warn('[dashboard]', message)
    return { ok: false, error: message }
  }
}
