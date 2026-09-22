import { RequestsInbox } from '@/components/admin/requests-inbox'
import {
  getAdminContactEnquiries,
  getAdminPropertySubmissions,
  getAdminServiceEnquiries,
  getAdminViewingBookings,
} from '@/lib/requests/actions'

export const metadata = {
  title: 'Requests — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const TABS = new Set(['bookings', 'submissions', 'contact', 'services'])

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const [bookings, submissions, contact, services] = await Promise.all([
    getAdminViewingBookings(),
    getAdminPropertySubmissions(),
    getAdminContactEnquiries(),
    getAdminServiceEnquiries(),
  ])

  const failed = [bookings, submissions, contact, services].find((r) => !r.ok)
  if (failed && !failed.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load requests: {failed.error}
      </div>
    )
  }

  if (!bookings.ok || !submissions.ok || !contact.ok || !services.ok) {
    return null
  }

  const initialTab = TABS.has(sp.tab || '')
    ? (sp.tab as 'bookings' | 'submissions' | 'contact' | 'services')
    : 'bookings'

  return (
    <RequestsInbox
      bookings={bookings.data}
      submissions={submissions.data}
      contactEnquiries={contact.data}
      serviceEnquiries={services.data}
      initialTab={initialTab}
    />
  )
}
