import { HomeContentEditor } from '@/components/admin/home-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Home & marketing — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminHomeContentPage() {
  const home = await getSiteContentRaw('home')
  return <HomeContentEditor initial={home} />
}
