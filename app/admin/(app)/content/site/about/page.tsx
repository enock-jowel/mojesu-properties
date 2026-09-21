import { AboutContentEditor } from '@/components/admin/about-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'About content — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminAboutContentPage() {
  const about = await getSiteContentRaw('about')
  return <AboutContentEditor initial={about} />
}
