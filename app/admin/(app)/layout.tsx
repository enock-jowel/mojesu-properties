import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { createClient } from '@/lib/supabase/server'

export default async function AdminAppLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['staff', 'admin'].includes(profile.role)) {
    redirect('/admin/login/')
  }

  return (
    <AdminShell
      userEmail={user.email}
      userName={profile.full_name || user.email?.split('@')[0]}
    >
      {children}
    </AdminShell>
  )
}
