import { InsightEditor } from '@/components/admin/insight-editor'

export const metadata = {
  title: 'New insight — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default function NewInsightPage() {
  return <InsightEditor />
}
