import { ListingEditor } from '@/components/admin/listing-editor'
import { getAdminPropertySubmission } from '@/lib/requests/actions'
import { submissionToListingPrefill } from '@/lib/requests/submission-to-listing'

export const metadata = {
  title: 'New listing — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams
  let prefill = undefined

  if (from) {
    const result = await getAdminPropertySubmission(from)
    if (result.ok) {
      prefill = await submissionToListingPrefill(result.data)
    }
  }

  return <ListingEditor prefill={prefill} />
}
