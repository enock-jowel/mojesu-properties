import { ServicesTable } from '@/components/admin/services-table'
import { getAdminServices } from '@/lib/content/actions'

export const metadata = {
  title: 'Services — Mojesu Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const result = await getAdminServices()

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface-alt px-4 py-8 text-sm text-neutral-muted">
        Could not load services: {result.error}
      </div>
    )
  }

  return <ServicesTable services={result.data} />
}
