import { ReviewsTable } from '@/components/admin/reviews-table'
import { getAdminReviews } from '@/lib/content/actions'

export const metadata = {
  title: 'Reviews — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const result = await getAdminReviews()

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load reviews: {result.error}
      </div>
    )
  }

  return <ReviewsTable reviews={result.data} />
}
