import { ViewingContentEditor } from '@/components/admin/viewing-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Viewing fees — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminViewingPage() {
  const viewing = await getSiteContentRaw('viewing')
  return <ViewingContentEditor initial={viewing} />
}
