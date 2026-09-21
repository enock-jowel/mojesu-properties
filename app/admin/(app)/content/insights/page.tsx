import { InsightsTable } from '@/components/admin/insights-table'
import { getAdminInsights } from '@/lib/content/actions'

export const metadata = {
  title: 'Insights — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminInsightsPage() {
  const result = await getAdminInsights()

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load insights: {result.error}
      </div>
    )
  }

  return <InsightsTable insights={result.data} />
}
