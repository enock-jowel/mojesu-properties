'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import {
  changePassword,
  updateDisplayName,
} from '@/lib/settings/actions'
import { signOutAdmin } from '@/lib/listings/actions'
import { showToast } from '@/lib/toast'

export function AccountSettings({
  email,
  initialName,
}: {
  email: string
  initialName: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameSaving, setNameSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault()
    setNameError(null)
    setNameSaving(true)
    const result = await updateDisplayName(name)
    setNameSaving(false)
    if (!result.ok) {
      setNameError(result.error)
      return
    }
    showToast('Display name updated')
    router.refresh()
  }

  async function onSavePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwSaving(true)
    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    setPwSaving(false)
    if (!result.ok) {
      setPwError(result.error)
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast('Password updated')
  }

  async function onSignOut() {
    await signOutAdmin()
    router.replace('/admin/login/')
    router.refresh()
  }

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <form
        onSubmit={(e) => void onSaveName(e)}
        className="rounded-2xl border border-neutral-light/80 bg-surface-alt/30 p-5"
      >
        <h2 className="text-base font-extrabold text-ink">Profile</h2>
        <p className="mt-1 text-xs text-neutral-muted">
          How your name appears in the staff CMS.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Display name</Label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <input
              className={`${fieldClass} cursor-not-allowed opacity-80`}
              value={email}
              readOnly
              tabIndex={-1}
            />
            <p className="mt-1 text-[11px] text-neutral-muted">
              Managed by Supabase Auth — contact an admin to change it.
            </p>
          </div>
        </div>
        {nameError ? (
          <p className="mt-3 text-sm font-semibold text-red-600">{nameError}</p>
        ) : null}
        <div className="mt-4">
          <ArrowPillButton type="submit" disabled={nameSaving}>
            {nameSaving ? 'Saving…' : 'Save name'}
          </ArrowPillButton>
        </div>
      </form>

      <form
        onSubmit={(e) => void onSavePassword(e)}
        className="rounded-2xl border border-neutral-light/80 bg-surface-alt/30 p-5"
      >
        <h2 className="text-base font-extrabold text-ink">Change password</h2>
        <p className="mt-1 text-xs text-neutral-muted">
          Enter your current password, then choose a new one.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Current password</Label>
            <input
              type="password"
              className={fieldClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <Label>New password</Label>
            <input
              type="password"
              className={fieldClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div>
            <Label>Confirm new password</Label>
            <input
              type="password"
              className={fieldClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
        </div>
        {pwError ? (
          <p className="mt-3 text-sm font-semibold text-red-600">{pwError}</p>
        ) : null}
        <div className="mt-4">
          <ArrowPillButton type="submit" disabled={pwSaving}>
            {pwSaving ? 'Updating…' : 'Update password'}
          </ArrowPillButton>
        </div>
      </form>

      <div className="rounded-2xl border border-neutral-light/80 bg-surface-alt/30 p-5">
        <h2 className="text-base font-extrabold text-ink">Session</h2>
        <p className="mt-1 text-xs text-neutral-muted">
          Sign out of the staff CMS on this device.
        </p>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="mt-4 rounded-full border border-neutral-light bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-pill-soft"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
