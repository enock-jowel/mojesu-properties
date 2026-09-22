import { notFound } from 'next/navigation'
import { ServiceEnquiryDetail } from '@/components/admin/service-enquiry-detail'
import { getAdminServiceEnquiry } from '@/lib/requests/actions'

export const metadata = {
  title: 'Service enquiry — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminServiceEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminServiceEnquiry(id)
  if (!result.ok) notFound()

  return <ServiceEnquiryDetail enquiry={result.data} />
}
