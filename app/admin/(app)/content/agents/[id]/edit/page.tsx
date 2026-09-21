import { notFound } from 'next/navigation'
import { AgentEditor } from '@/components/admin/agent-editor'
import { getAdminAgent } from '@/lib/content/actions'

export const metadata = {
  title: 'Edit agent — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminAgent(id)
  if (!result.ok) notFound()

  return <AgentEditor initial={result.data} />
}
