import { notFound } from 'next/navigation'
import { ContactEnquiryDetail } from '@/components/admin/contact-enquiry-detail'
import { getAdminContactEnquiry } from '@/lib/requests/actions'

export const metadata = {
  title: 'Contact enquiry — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminContactEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminContactEnquiry(id)
  if (!result.ok) notFound()

  return <ContactEnquiryDetail enquiry={result.data} />
}
