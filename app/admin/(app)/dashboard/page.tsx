import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/admin/auth'
import { getDashboardSnapshot } from '@/lib/dashboard/queries'
import { DashboardClient } from './dashboard-client'

export const metadata = {
  title: 'Overview — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    redirect('/admin/login/')
  }

  const sp = await searchParams
  const result = await getDashboardSnapshot({
    from: sp.from || null,
    to: sp.to || null,
  })

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load dashboard: {result.error}
      </div>
    )
  }

  return <DashboardClient data={result.data} />
}
