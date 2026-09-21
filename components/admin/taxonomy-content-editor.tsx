'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { LabelOption, TaxonomyContent } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

function OptionList({
  title,
  items,
  onChange,
}: {
  title: string
  items: LabelOption[]
  onChange: (items: LabelOption[]) => void
}) {
  return (
    <SiteCard title={title}>
      <p className="mb-2 text-[11px] text-neutral-muted">
        Value keys stay stable for filtering — only edit the label officers see.
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={`${item.value}-${i}`} className="flex gap-2">
            <input
              className="w-36 shrink-0 rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-xs text-neutral-muted"
              value={item.value}
              readOnly
              title="Stable key — not editable"
            />
            <input
              className="min-w-0 flex-1 rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-sm text-ink"
              value={item.label}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...item, label: e.target.value }
                onChange(next)
              }}
            />
          </li>
        ))}
      </ul>
    </SiteCard>
  )
}

function RecordEditor({
  title,
  hint,
  value,
  onChange,
}: {
  title: string
  hint?: string
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  const entries = Object.entries(value)
  return (
    <SiteCard title={title}>
      {hint ? (
        <p className="mb-2 text-[11px] text-neutral-muted">{hint}</p>
      ) : null}
      <ul className="space-y-2">
        {entries.map(([key, label]) => (
          <li key={key} className="flex gap-2">
            <span className="w-36 shrink-0 truncate rounded-lg bg-surface-alt px-2 py-1.5 text-xs text-neutral-muted">
              {key}
            </span>
            <input
              className="min-w-0 flex-1 rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-sm text-ink"
              value={label}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          </li>
        ))}
      </ul>
    </SiteCard>
  )
}

export function TaxonomyContentEditor({
  initial,
}: {
  initial: TaxonomyContent
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveSiteContent('taxonomy', data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Labels & kinds saved')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Labels & kinds</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Amenity names, property type labels, title tenure, and search tab
          wording.
        </p>
      </div>

      <RecordEditor
        title="Amenity labels"
        hint="Icons stay fixed in code — edit the public name only."
        value={data.amenityLabels}
        onChange={(amenityLabels) => setData({ ...data, amenityLabels })}
      />

      <RecordEditor
        title="Title status"
        value={data.titleStatus}
        onChange={(titleStatus) => setData({ ...data, titleStatus })}
      />

      <OptionList
        title="Residential types"
        items={data.residential}
        onChange={(residential) => setData({ ...data, residential })}
      />
      <OptionList
        title="Land types"
        items={data.land}
        onChange={(land) => setData({ ...data, land })}
      />
      <OptionList
        title="Commercial types"
        items={data.commercial}
        onChange={(commercial) => setData({ ...data, commercial })}
      />
      <OptionList
        title="Industrial types"
        items={data.industrial}
        onChange={(industrial) => setData({ ...data, industrial })}
      />
      <OptionList
        title="Mixed-use types"
        items={data.mixedUse}
        onChange={(mixedUse) => setData({ ...data, mixedUse })}
      />

      <RecordEditor
        title="List-with-us category labels"
        value={data.intakeCategory}
        onChange={(intakeCategory) => setData({ ...data, intakeCategory })}
      />
      <RecordEditor
        title="List-with-us mode labels"
        value={data.intakeMode}
        onChange={(intakeMode) => setData({ ...data, intakeMode })}
      />

      <SiteCard title="Hero search tabs">
        <TextField
          label="Rent"
          value={data.heroMainTabs.rent}
          onChange={(v) =>
            setData({
              ...data,
              heroMainTabs: { ...data.heroMainTabs, rent: v },
            })
          }
        />
        <TextField
          label="Buy"
          value={data.heroMainTabs.buy}
          onChange={(v) =>
            setData({
              ...data,
              heroMainTabs: { ...data.heroMainTabs, buy: v },
            })
          }
        />
        <TextField
          label="Land"
          value={data.heroMainTabs.land}
          onChange={(v) =>
            setData({
              ...data,
              heroMainTabs: { ...data.heroMainTabs, land: v },
            })
          }
        />
        <TextField
          label="Residential sub-tab"
          value={data.heroSubTabs.residential}
          onChange={(v) =>
            setData({
              ...data,
              heroSubTabs: { ...data.heroSubTabs, residential: v },
            })
          }
        />
        <TextField
          label="Commercial sub-tab"
          value={data.heroSubTabs.commercial}
          onChange={(v) =>
            setData({
              ...data,
              heroSubTabs: { ...data.heroSubTabs, commercial: v },
            })
          }
        />
        <TextField
          label="Industrial sub-tab"
          value={data.heroSubTabs.industrial}
          onChange={(v) =>
            setData({
              ...data,
              heroSubTabs: { ...data.heroSubTabs, industrial: v },
            })
          }
        />
        <TextField
          label="Mixed-use sub-tab"
          value={data.heroSubTabs['mixed-use']}
          onChange={(v) =>
            setData({
              ...data,
              heroSubTabs: { ...data.heroSubTabs, 'mixed-use': v },
            })
          }
        />
        <TextField
          label="All land sub-tab"
          value={data.heroSubTabs.allLand}
          onChange={(v) =>
            setData({
              ...data,
              heroSubTabs: { ...data.heroSubTabs, allLand: v },
            })
          }
        />
      </SiteCard>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ArrowPillButton onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save labels'}
      </ArrowPillButton>
    </div>
  )
}
