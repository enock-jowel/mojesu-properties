'use client'

import dynamic from 'next/dynamic'
import type { DashboardSnapshot } from '@/lib/dashboard/types'

const DashboardOverview = dynamic(
  () =>
    import('@/components/admin/dashboard-overview').then((m) => m.DashboardOverview),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-10 text-sm text-neutral-muted">
        Loading overview…
      </div>
    ),
  },
)

export function DashboardClient({ data }: { data: DashboardSnapshot }) {
  return <DashboardOverview data={data} />
}
