import { notFound } from 'next/navigation'
import { BookingDetail } from '@/components/admin/booking-detail'
import { getAdminViewingBooking } from '@/lib/requests/actions'

export const metadata = {
  title: 'Viewing booking — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminViewingBooking(id)
  if (!result.ok) notFound()

  return (
    <BookingDetail
      booking={result.data.booking}
      listings={result.data.listings}
    />
  )
}
