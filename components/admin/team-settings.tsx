'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X } from 'lucide-react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import type { StaffRole } from '@/lib/admin/auth'
import {
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from '@/lib/settings/actions'
import type { TeamMember } from '@/lib/settings/types'
import { showToast } from '@/lib/toast'

function RolePill({ role }: { role: StaffRole }) {
  const cls =
    role === 'admin'
      ? 'bg-pill-soft-cool text-accent-deep'
      : 'bg-pill-soft text-secondary'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {role}
    </span>
  )
}

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function TeamSettings({
  members: initialMembers,
  currentUserId,
}: {
  members: TeamMember[]
  currentUserId: string
}) {
  const router = useRouter()
  const [members, setMembers] = useState(initialMembers)
  useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<StaffRole>('staff')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSaving, setInviteSaving] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const adminCount = useMemo(
    () => members.filter((m) => m.role === 'admin').length,
    [members],
  )

  async function onInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError(null)
    setInviteSaving(true)
    const result = await inviteTeamMember({
      email: inviteEmail,
      role: inviteRole,
    })
    setInviteSaving(false)
    if (!result.ok) {
      setInviteError(result.error)
      return
    }
    showToast('Invite sent')
    setInviteOpen(false)
    setInviteEmail('')
    setInviteRole('staff')
    router.refresh()
  }

  async function onRoleChange(id: string, role: StaffRole) {
    setRowError(null)
    setBusyId(id)
    const result = await updateTeamMemberRole(id, role)
    setBusyId(null)
    if (!result.ok) {
      setRowError(result.error)
      return
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m)),
    )
    showToast('Role updated')
    router.refresh()
  }

  async function onConfirmRemove() {
    if (!removingId) return
    setRowError(null)
    setBusyId(removingId)
    const result = await removeTeamMember(removingId)
    setBusyId(null)
    if (!result.ok) {
      setRowError(result.error)
      setRemovingId(null)
      return
    }
    setMembers((prev) => prev.filter((m) => m.id !== removingId))
    setRemovingId(null)
    showToast('Team member removed')
    router.refresh()
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-ink">Team</h2>
          <p className="mt-1 text-xs text-neutral-muted">
            Invite-only staff access — no public signup.
          </p>
        </div>
        <ArrowPillButton
          type="button"
          onClick={() => {
            setInviteError(null)
            setInviteOpen(true)
          }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Invite team member
          </span>
        </ArrowPillButton>
      </div>

      {rowError ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {rowError}
        </p>
      ) : null}

      <ul className="divide-y divide-neutral-light/80 overflow-hidden rounded-2xl border border-neutral-light/80 bg-surface-alt/30">
        {members.map((m) => {
          const isSelf = m.id === currentUserId
          const demoteBlocked = m.role === 'admin' && adminCount <= 1
          return (
            <li
              key={m.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold text-ink">
                    {m.fullName || m.email.split('@')[0] || 'Staff'}
                    {isSelf ? (
                      <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                        you
                      </span>
                    ) : null}
                  </p>
                  <RolePill role={m.role} />
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-muted">
                  {m.email || '—'}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-muted">
                  Joined {formatJoined(m.joinedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  className={`${fieldClass} w-auto min-w-[7.5rem] py-1.5 text-xs`}
                  value={m.role}
                  disabled={busyId === m.id || demoteBlocked}
                  onChange={(e) =>
                    void onRoleChange(m.id, e.target.value as StaffRole)
                  }
                  aria-label={`Role for ${m.email}`}
                >
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  disabled={isSelf || busyId === m.id}
                  onClick={() => setRemovingId(m.id)}
                  className="rounded-lg p-2 text-neutral-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove ${m.email}`}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              {demoteBlocked && isSelf ? (
                <p className="text-[11px] font-medium text-neutral-muted sm:basis-full">
                  You are the only admin — promote someone else before changing
                  your role.
                </p>
              ) : null}
            </li>
          )
        })}
        {members.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-neutral-muted">
            No team members yet.
          </li>
        ) : null}
      </ul>

      {inviteOpen ? (
        <div className="fixed inset-0 z-[180] flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal
            aria-labelledby="invite-title"
            className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 id="invite-title" className="text-lg font-extrabold text-ink">
                  Invite team member
                </h3>
                <p className="mt-1 text-xs text-neutral-muted">
                  Sends a Supabase Auth invite email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-full p-1.5 text-neutral-muted hover:bg-surface-alt hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={(e) => void onInvite(e)} className="space-y-3">
              <div>
                <Label>Email</Label>
                <input
                  type="email"
                  className={fieldClass}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  className={fieldClass}
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as StaffRole)
                  }
                >
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              {inviteError ? (
                <p className="text-sm font-semibold text-red-600">
                  {inviteError}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-muted hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <ArrowPillButton type="submit" disabled={inviteSaving}>
                  {inviteSaving ? 'Sending…' : 'Send invite'}
                </ArrowPillButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {removingId ? (
        <div className="fixed inset-0 z-[180] flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal
            className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl"
          >
            <h3 className="text-lg font-extrabold text-ink">Remove staff?</h3>
            <p className="mt-2 text-sm text-neutral-muted">
              This deletes their login and profile. They will lose CMS access
              immediately.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemovingId(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-muted hover:bg-surface-alt"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirmRemove()}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
