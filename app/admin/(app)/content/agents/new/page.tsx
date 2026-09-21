import { AgentEditor } from '@/components/admin/agent-editor'

export const metadata = {
  title: 'New agent — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default function NewAgentPage() {
  return <AgentEditor />
}
