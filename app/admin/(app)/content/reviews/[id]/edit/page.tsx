import { notFound } from 'next/navigation'
import { ReviewEditor } from '@/components/admin/review-editor'
import { getAdminReview } from '@/lib/content/actions'

export const metadata = {
  title: 'Edit review — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminReview(id)
  if (!result.ok) notFound()

  return <ReviewEditor initial={result.data} />
}
