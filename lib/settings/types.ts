import type { StaffRole } from '@/lib/admin/auth'

export type TeamMember = {
  id: string
  fullName: string | null
  email: string
  role: StaffRole
  joinedAt: string
}

export type NotificationSettingsRow = {
  id: string
  notify_email: string | null
  whatsapp_number: string | null
  updated_by: string | null
  updated_at: string
  updater_name?: string | null
}
