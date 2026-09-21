import { NavContentEditor } from '@/components/admin/nav-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Navigation — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminNavPage() {
  const nav = await getSiteContentRaw('nav')
  return <NavContentEditor initial={nav} />
}
