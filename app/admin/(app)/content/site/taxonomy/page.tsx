import { TaxonomyContentEditor } from '@/components/admin/taxonomy-content-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Labels & kinds — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminTaxonomyPage() {
  const taxonomy = await getSiteContentRaw('taxonomy')
  return <TaxonomyContentEditor initial={taxonomy} />
}
