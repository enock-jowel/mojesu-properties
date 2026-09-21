'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { NavContent, NavLink } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

function LinkList({
  title,
  items,
  onChange,
}: {
  title: string
  items: NavLink[]
  onChange: (items: NavLink[]) => void
}) {
  return (
    <SiteCard title={title}>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-sm text-ink"
              value={item.label}
              placeholder="Label"
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...item, label: e.target.value }
                onChange(next)
              }}
            />
            <input
              className="min-w-0 flex-[1.2] rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-sm text-ink"
              value={item.href}
              placeholder="/path/"
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...item, href: e.target.value }
                onChange(next)
              }}
            />
            <button
              type="button"
              aria-label="Remove link"
              className="rounded-lg p-2 text-neutral-muted hover:bg-surface-alt hover:text-ink"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        onClick={() => onChange([...items, { label: 'New link', href: '/' }])}
      >
        <Plus className="h-4 w-4" /> Add link
      </button>
    </SiteCard>
  )
}

export function NavContentEditor({ initial }: { initial: NavContent }) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveSiteContent('nav', data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Navigation saved')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Navigation</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Header links, list CTA, and footer columns.
        </p>
      </div>

      <LinkList
        title="Header links"
        items={data.header}
        onChange={(header) => setData({ ...data, header })}
      />

      <SiteCard title="Header CTA">
        <TextField
          label="Label"
          value={data.headerCta.label}
          onChange={(v) =>
            setData({ ...data, headerCta: { ...data.headerCta, label: v } })
          }
        />
        <TextField
          label="Href"
          value={data.headerCta.href}
          onChange={(v) =>
            setData({ ...data, headerCta: { ...data.headerCta, href: v } })
          }
        />
      </SiteCard>

      <SiteCard title="Footer column titles">
        <TextField
          label="Menu column"
          value={data.footerMenuTitle}
          onChange={(v) => setData({ ...data, footerMenuTitle: v })}
        />
        <TextField
          label="Company column"
          value={data.footerCompanyTitle}
          onChange={(v) => setData({ ...data, footerCompanyTitle: v })}
        />
        <TextField
          label="Contact column"
          value={data.footerContactTitle}
          onChange={(v) => setData({ ...data, footerContactTitle: v })}
        />
        <TextField
          label="Legal name"
          value={data.legalName}
          onChange={(v) => setData({ ...data, legalName: v })}
        />
      </SiteCard>

      <LinkList
        title="Footer menu links"
        items={data.footerMenu}
        onChange={(footerMenu) => setData({ ...data, footerMenu })}
      />
      <LinkList
        title="Footer company links"
        items={data.footerCompany}
        onChange={(footerCompany) => setData({ ...data, footerCompany })}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ArrowPillButton onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save navigation'}
      </ArrowPillButton>
    </div>
  )
}
