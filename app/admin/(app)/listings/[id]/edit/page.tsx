import { notFound } from 'next/navigation'
import { ListingEditor } from '@/components/admin/listing-editor'
import { getAdminListing } from '@/lib/listings/actions'

export const metadata = {
  title: 'Edit listing — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminListing(id)
  if (!result.ok) notFound()

  return <ListingEditor initial={result.data} />
}
