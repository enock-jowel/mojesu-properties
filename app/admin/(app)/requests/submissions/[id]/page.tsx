import { notFound } from 'next/navigation'
import { SubmissionDetail } from '@/components/admin/submission-detail'
import { getAdminPropertySubmission } from '@/lib/requests/actions'

export const metadata = {
  title: 'Property submission — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminPropertySubmission(id)
  if (!result.ok) notFound()

  return <SubmissionDetail submission={result.data} />
}
