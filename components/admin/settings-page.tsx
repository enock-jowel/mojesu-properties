'use client'

import { useMemo, useState } from 'react'
import type { StaffRole } from '@/lib/admin/auth'
import type { NotificationSettingsRow, TeamMember } from '@/lib/settings/types'
import { AccountSettings } from '@/components/admin/account-settings'
import { TeamSettings } from '@/components/admin/team-settings'
import { NotificationSettings } from '@/components/admin/notification-settings'

type TabId = 'account' | 'team' | 'notifications'

export function SettingsPage({
  role,
  email,
  displayName,
  currentUserId,
  teamMembers,
  notificationSettings,
  envFallbackEmail,
  envFallbackWhatsapp,
}: {
  role: StaffRole
  email: string
  displayName: string
  currentUserId: string
  teamMembers: TeamMember[]
  notificationSettings: NotificationSettingsRow | null
  envFallbackEmail: string
  envFallbackWhatsapp: string
}) {
  const isAdmin = role === 'admin'
  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [
      { id: 'account', label: 'Account' },
    ]
    if (isAdmin) {
      list.push(
        { id: 'team', label: 'Team' },
        { id: 'notifications', label: 'Notifications' },
      )
    }
    return list
  }, [isAdmin])

  const [tab, setTab] = useState<TabId>('account')
  const active = tabs.some((t) => t.id === tab) ? tab : 'account'

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-neutral-muted">
        Your account{isAdmin ? ', team, and notification targets' : ''}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                on
                  ? 'bg-pill-soft text-ink ring-1 ring-primary/30'
                  : 'bg-surface-alt text-neutral-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {active === 'account' ? (
          <AccountSettings email={email} initialName={displayName} />
        ) : null}
        {active === 'team' && isAdmin ? (
          <TeamSettings
            members={teamMembers}
            currentUserId={currentUserId}
          />
        ) : null}
        {active === 'notifications' && isAdmin ? (
          <NotificationSettings
            initial={notificationSettings}
            envFallbackEmail={envFallbackEmail}
            envFallbackWhatsapp={envFallbackWhatsapp}
          />
        ) : null}
      </div>
    </div>
  )
}
