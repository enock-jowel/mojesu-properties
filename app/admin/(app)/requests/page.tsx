import { RequestsInbox } from '@/components/admin/requests-inbox'
import {
  getAdminPropertySubmissions,
  getAdminViewingBookings,
} from '@/lib/requests/actions'

export const metadata = {
  title: 'Requests — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const [bookings, submissions] = await Promise.all([
    getAdminViewingBookings(),
    getAdminPropertySubmissions(),
  ])

  if (!bookings.ok || !submissions.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load requests
        {!bookings.ok ? `: ${bookings.error}` : ''}
        {!submissions.ok ? `: ${submissions.error}` : ''}
      </div>
    )
  }

  const initialTab =
    sp.tab === 'submissions' ? 'submissions' : 'bookings'

  return (
    <RequestsInbox
      bookings={bookings.data}
      submissions={submissions.data}
      initialTab={initialTab}
    />
  )
}
