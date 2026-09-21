import { ServiceEditor } from '@/components/admin/service-editor'

export const metadata = {
  title: 'New service — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default function NewServicePage() {
  return <ServiceEditor />
}
