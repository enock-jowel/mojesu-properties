import { ListWithUsEditor } from '@/components/admin/list-with-us-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'List with us — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminListWithUsContentPage() {
  const content = await getSiteContentRaw('list_with_us')
  return <ListWithUsEditor initial={content} />
}
