import { redirect } from 'next/navigation'
import { SettingsPage } from '@/components/admin/settings-page'
import { createClient } from '@/lib/supabase/server'
import type { StaffRole } from '@/lib/admin/auth'
import {
  getNotificationSettings,
  listTeamMembers,
} from '@/lib/settings/queries'
import { resolveNotifyEnv } from '@/lib/viewing-bookings'

export const metadata = {
  title: 'Settings — Mojesu Admin',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsRoute() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as StaffRole) || 'staff'
  const isAdmin = role === 'admin'

  const [teamMembers, notificationSettings] = isAdmin
    ? await Promise.all([listTeamMembers(), getNotificationSettings()])
    : [[], null]

  const env = resolveNotifyEnv(
    process.env as Record<string, string | undefined>,
  )

  return (
    <SettingsPage
      role={role}
      email={user.email || ''}
      displayName={
        profile?.full_name || user.email?.split('@')[0] || 'Staff'
      }
      currentUserId={user.id}
      teamMembers={teamMembers}
      notificationSettings={notificationSettings}
      envFallbackEmail={env.NOTIFY_EMAIL_TO}
      envFallbackWhatsapp={env.WHATSAPP_NUMBER}
    />
  )
}
