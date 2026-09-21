import { ReviewEditor } from '@/components/admin/review-editor'

export const metadata = {
  title: 'New review — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default function NewReviewPage() {
  return <ReviewEditor />
}
