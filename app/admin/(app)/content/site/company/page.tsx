import { CompanyContactEditor } from '@/components/admin/company-contact-editor'
import { getSiteContentRaw } from '@/lib/site-content/queries'

export const metadata = {
  title: 'Company & contact — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminCompanyContactPage() {
  const [company, contact] = await Promise.all([
    getSiteContentRaw('company'),
    getSiteContentRaw('contact'),
  ])
  return (
    <CompanyContactEditor
      initialCompany={company}
      initialContact={contact}
    />
  )
}
