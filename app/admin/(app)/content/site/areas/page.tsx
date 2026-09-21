import { AreasContentEditor } from '@/components/admin/areas-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Areas — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminAreasPage() {
  const areas = await getSiteContentRaw('areas')
  return <AreasContentEditor initial={areas} />
}
