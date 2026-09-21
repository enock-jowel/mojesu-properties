import { notFound } from 'next/navigation'
import { ServiceEditor } from '@/components/admin/service-editor'
import { getAdminService } from '@/lib/content/actions'

export const metadata = {
  title: 'Edit service — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminService(id)
  if (!result.ok) notFound()

  return <ServiceEditor initial={result.data} />
}
