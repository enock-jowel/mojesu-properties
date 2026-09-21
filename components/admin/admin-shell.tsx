'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  FileText,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Settings,
} from 'lucide-react'
import { SiteLogo } from '@/components/site-logo'
import { Toast } from '@/components/toast'
import { signOutAdmin } from '@/lib/listings/actions'

const NAV = [
  { href: '/admin/dashboard/', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/listings/', label: 'Listings', icon: LayoutGrid },
  { href: '/admin/requests/', label: 'Requests', icon: Inbox },
  { href: '/admin/content/', label: 'Content', icon: FileText },
  { href: '/admin/settings/', label: 'Settings', icon: Settings },
] as const

export function AdminShell({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode
  userEmail?: string | null
  userName?: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function onSignOut() {
    await signOutAdmin()
    router.replace('/admin/login/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-neutral-light/80 bg-background md:flex md:flex-col">
          <div className="border-b border-neutral-light/80 px-4 py-4">
            <Link href="/admin/dashboard/" className="inline-flex">
              <SiteLogo markClassName="h-7 w-7" wordmarkClassName="text-base" />
            </Link>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Staff CMS
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href.replace(/\/$/, ''))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-pill-soft text-ink'
                      : 'text-neutral-muted hover:bg-surface-alt hover:text-ink'
                  }`}
                >
                  <span
                    className={`h-4 w-0.5 rounded-full ${
                      active ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-neutral-light/80 p-3">
            <div className="mb-2 truncate px-2 text-xs text-neutral-muted">
              <p className="truncate font-semibold text-ink">
                {userName || 'Staff'}
              </p>
              <p className="truncate">{userEmail}</p>
            </div>
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-muted transition-colors hover:bg-surface-alt hover:text-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-neutral-light/80 bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3 md:hidden">
              <SiteLogo markClassName="h-7 w-7" wordmarkClassName="text-base" />
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <p className="hidden text-sm font-semibold text-ink md:block">
              Staff CMS
            </p>
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-neutral-muted"
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="flex gap-1 overflow-x-auto border-b border-neutral-light/80 px-3 py-2 md:hidden">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href.replace(/\/$/, ''))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? 'bg-pill-soft text-ink'
                      : 'text-neutral-muted'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="flex-1 px-4 py-5 md:px-8 md:py-7">{children}</div>
        </div>
      </div>
      <Toast />
    </div>
  )
}
