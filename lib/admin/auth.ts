import { createClient } from '@/lib/supabase/server'

export type StaffRole = 'superadmin' | 'admin' | 'staff'

export type StaffProfile = {
  full_name: string | null
  role: StaffRole
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

const STAFF_ROLES: StaffRole[] = ['superadmin', 'admin', 'staff']
const ADMIN_ROLES: StaffRole[] = ['superadmin', 'admin']

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return !!role && STAFF_ROLES.includes(role as StaffRole)
}

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role as StaffRole)
}

export async function requireStaff() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
      error: 'Not signed in' as const,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !isStaffRole(profile.role)) {
    return {
      supabase,
      user: null,
      profile: null,
      error: 'Staff access required' as const,
    }
  }

  return {
    supabase,
    user,
    profile: profile as StaffProfile,
    error: null,
  }
}

export async function requireAdmin() {
  const gate = await requireStaff()
  if (gate.error || !gate.user || !gate.profile) {
    return {
      ...gate,
      error: gate.error || ('Staff access required' as const),
    }
  }
  if (!isAdminRole(gate.profile.role)) {
    return {
      ...gate,
      user: null,
      profile: null,
      error: 'Admin access required' as const,
    }
  }
  return gate
}

export async function requireSuperAdmin() {
  const gate = await requireAdmin()
  if (gate.error || !gate.user || !gate.profile) {
    return {
      ...gate,
      error: gate.error || ('Admin access required' as const),
    }
  }
  if (gate.profile.role !== 'superadmin') {
    return {
      ...gate,
      user: null,
      profile: null,
      error: 'Superadmin access required' as const,
    }
  }
  return gate
}
