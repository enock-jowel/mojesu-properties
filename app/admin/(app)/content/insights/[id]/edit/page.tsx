import { notFound } from 'next/navigation'
import { InsightEditor } from '@/components/admin/insight-editor'
import { getAdminInsight } from '@/lib/content/actions'

export const metadata = {
  title: 'Edit insight — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditInsightPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminInsight(id)
  if (!result.ok) notFound()

  return <InsightEditor initial={result.data} />
}
