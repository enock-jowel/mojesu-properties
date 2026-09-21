import { createServiceClient } from '@/lib/supabase/admin'
import type { StaffRole } from '@/lib/admin/auth'
import type { NotificationSettingsRow, TeamMember } from '@/lib/settings/types'

export async function listTeamMembers(): Promise<TeamMember[]> {
  const admin = createServiceClient()
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('role', ['admin', 'staff'])
    .order('created_at', { ascending: true })

  if (error || !profiles) return []

  const { data: authData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  const emailById = new Map(
    (authData?.users || []).map((u) => [u.id, u.email || '']),
  )

  return profiles.map((p) => ({
    id: p.id as string,
    fullName: (p.full_name as string | null) ?? null,
    email: emailById.get(p.id as string) || '',
    role: p.role as StaffRole,
    joinedAt: p.created_at as string,
  }))
}

export async function getNotificationSettings(): Promise<NotificationSettingsRow | null> {
  const admin = createServiceClient()
  const { data, error } = await admin
    .from('notification_settings')
    .select('id, notify_email, whatsapp_number, updated_by, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  let updater_name: string | null = null
  if (data.updated_by) {
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', data.updated_by)
      .maybeSingle()
    updater_name = profile?.full_name ?? null
  }

  return {
    id: data.id,
    notify_email: data.notify_email,
    whatsapp_number: data.whatsapp_number,
    updated_by: data.updated_by,
    updated_at: data.updated_at,
    updater_name,
  }
}
