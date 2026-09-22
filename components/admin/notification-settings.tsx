'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import { saveNotificationSettings } from '@/lib/settings/actions'
import type { NotificationSettingsRow } from '@/lib/settings/types'
import { showToast } from '@/lib/toast'

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function NotificationSettings({
  initial,
  envFallbackEmail,
  envFallbackWhatsapp,
}: {
  initial: NotificationSettingsRow | null
  envFallbackEmail: string
  envFallbackWhatsapp: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState(
    initial?.notify_email || envFallbackEmail || '',
  )
  const [whatsapp, setWhatsapp] = useState(
    initial?.whatsapp_number || envFallbackWhatsapp || '',
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const result = await saveNotificationSettings({
      notifyEmail: email,
      whatsappNumber: whatsapp,
    })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    showToast('Notification settings saved')
    router.refresh()
  }

  const lastLine =
    initial?.updated_by && initial.updated_at
      ? `Last updated by ${initial.updater_name || 'staff'} on ${formatUpdated(initial.updated_at)}`
      : 'Not saved yet — env defaults apply until you save.'

  return (
    <form
      onSubmit={(e) => void onSave(e)}
      className="max-w-xl rounded-2xl border border-neutral-light/80 bg-surface-alt/30 p-5"
    >
      <h2 className="text-base font-extrabold text-ink">Notifications</h2>
      <p className="mt-1 text-xs text-neutral-muted">
        Where viewing bookings, list-with-us, contact, and service enquiries are
        sent. Env vars remain a fallback until this is saved.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <Label>Notification email</Label>
          <input
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@mojesuproperties.com"
            required
          />
          <p className="mt-1 text-[11px] text-neutral-muted">
            Receives all lead alert emails (bookings, submissions, contact,
            services).
          </p>
        </div>
        <div>
          <Label>WhatsApp number</Label>
          <input
            className={fieldClass}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="256780827159"
            inputMode="numeric"
            required
          />
          <p className="mt-1 text-[11px] text-neutral-muted">
            Digits with country code, no + — used for wa.me confirmation links.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
      ) : null}

      <p className="mt-4 text-[11px] text-neutral-muted">{lastLine}</p>

      <div className="mt-4">
        <ArrowPillButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save notifications'}
        </ArrowPillButton>
      </div>
    </form>
  )
}
