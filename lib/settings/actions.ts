'use server'

import { revalidatePath } from 'next/cache'
import {
  requireAdmin,
  requireStaff,
  type ActionResult,
  type StaffRole,
} from '@/lib/admin/auth'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'
import {
  getNotificationSettings,
  listTeamMembers,
} from '@/lib/settings/queries'
import type { NotificationSettingsRow, TeamMember } from '@/lib/settings/types'

function revalidateSettings() {
  revalidatePath('/admin/settings/')
}

export async function getTeamMembersAction(): Promise<
  ActionResult<TeamMember[]>
> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  return { ok: true, data: await listTeamMembers() }
}

export async function getNotificationSettingsAction(): Promise<
  ActionResult<NotificationSettingsRow | null>
> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  return { ok: true, data: await getNotificationSettings() }
}

export async function updateDisplayName(
  fullName: string,
): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  const name = fullName.trim()
  if (!name) return { ok: false, error: 'Display name is required.' }

  const { error } = await gate.supabase
    .from('profiles')
    .update({ full_name: name })
    .eq('id', gate.user.id)

  if (error) return { ok: false, error: error.message }
  revalidateSettings()
  revalidatePath('/admin/', 'layout')
  return { ok: true, data: undefined }
}

export async function changePassword(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ActionResult> {
  const gate = await requireStaff()
  if (gate.error || !gate.user?.email) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }

  const current = input.currentPassword
  const next = input.newPassword
  const confirm = input.confirmPassword

  if (!current || !next || !confirm) {
    return { ok: false, error: 'Fill in all password fields.' }
  }
  if (next.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters.' }
  }
  if (next !== confirm) {
    return { ok: false, error: 'New password and confirmation do not match.' }
  }

  const supabase = await createServerClient()
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: gate.user.email,
    password: current,
  })
  if (verifyError) {
    return { ok: false, error: 'Current password is incorrect.' }
  }

  const { error } = await supabase.auth.updateUser({ password: next })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

export async function inviteTeamMember(input: {
  email: string
  role: StaffRole
}): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }

  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (!['admin', 'staff'].includes(input.role)) {
    return { ok: false, error: 'Invalid role.' }
  }

  const admin = createServiceClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: input.role, full_name: email.split('@')[0] },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/login/`,
  })

  if (error || !data.user) {
    return { ok: false, error: error?.message || 'Invite failed.' }
  }

  // Ensure role is set (trigger may default to staff)
  await admin
    .from('profiles')
    .update({ role: input.role })
    .eq('id', data.user.id)

  revalidateSettings()
  return { ok: true, data: { id: data.user.id } }
}

export async function updateTeamMemberRole(
  userId: string,
  role: StaffRole,
): Promise<ActionResult> {
  const gate = await requireAdmin()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  if (!['admin', 'staff'].includes(role)) {
    return { ok: false, error: 'Invalid role.' }
  }

  const admin = createServiceClient()
  const { data: target } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle()

  if (!target) return { ok: false, error: 'Team member not found.' }

  if (target.role === 'admin' && role === 'staff') {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      return {
        ok: false,
        error: 'Cannot demote the only admin. Promote someone else first.',
      }
    }
  }

  const { error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { ok: false, error: error.message }
  revalidateSettings()
  return { ok: true, data: undefined }
}

export async function removeTeamMember(userId: string): Promise<ActionResult> {
  const gate = await requireAdmin()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }
  if (userId === gate.user.id) {
    return { ok: false, error: 'You cannot remove your own account.' }
  }

  const admin = createServiceClient()
  const { data: target } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle()

  if (!target) return { ok: false, error: 'Team member not found.' }

  if (target.role === 'admin') {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      return {
        ok: false,
        error: 'Cannot remove the only admin.',
      }
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }
  revalidateSettings()
  return { ok: true, data: undefined }
}

export async function saveNotificationSettings(input: {
  notifyEmail: string
  whatsappNumber: string
}): Promise<ActionResult> {
  const gate = await requireAdmin()
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error || 'Unauthorized' }
  }

  const notify_email = input.notifyEmail.trim()
  const whatsapp_number = input.whatsappNumber.replace(/\D/g, '')

  if (!notify_email || !notify_email.includes('@')) {
    return { ok: false, error: 'Enter a valid notification email.' }
  }
  if (whatsapp_number.length < 10) {
    return {
      ok: false,
      error: 'Enter WhatsApp as digits with country code (e.g. 256780827159).',
    }
  }

  const admin = createServiceClient()
  const existing = await getNotificationSettings()

  const row = {
    notify_email,
    whatsapp_number,
    updated_by: gate.user.id,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    const { error } = await admin
      .from('notification_settings')
      .update(row)
      .eq('id', existing.id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await admin.from('notification_settings').insert(row)
    if (error) return { ok: false, error: error.message }
  }

  revalidateSettings()
  return { ok: true, data: undefined }
}
