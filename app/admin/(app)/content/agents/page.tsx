import { AgentsTable } from '@/components/admin/agents-table'
import { getAdminAgents } from '@/lib/content/actions'

export const metadata = {
  title: 'Agents — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminAgentsPage() {
  const result = await getAdminAgents()

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load agents: {result.error}
      </div>
    )
  }

  return <AgentsTable agents={result.data} />
}
