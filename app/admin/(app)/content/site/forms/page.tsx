import { FormsContentEditor } from '@/components/admin/forms-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Form microcopy — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminFormsPage() {
  const forms = await getSiteContentRaw('forms')
  return <FormsContentEditor initial={forms} />
}
