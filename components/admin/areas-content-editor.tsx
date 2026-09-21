'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { AreasContent } from '@/lib/site-content/types'
import type { AreaTier } from '@/lib/areas'
import { showToast } from '@/lib/toast'

const TIERS: AreaTier[] = ['prime', 'mid', 'emerging']

export function AreasContentEditor({ initial }: { initial: AreasContent }) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [midAreasText, setMidAreasText] = useState(
    initial.midMarketRentalAreas.join(', '),
  )

  function save() {
    setError(null)
    const midMarketRentalAreas = midAreasText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    startTransition(async () => {
      const result = await saveSiteContent('areas', {
        ...data,
        midMarketRentalAreas,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Areas saved')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Area catalog</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Neighborhoods shown in search autocomplete and explore-by-area.
        </p>
      </div>

      <SiteCard title="Tier labels">
        {TIERS.map((tier) => (
          <TextField
            key={tier}
            label={tier}
            value={data.tierLabels[tier]}
            onChange={(v) =>
              setData({
                ...data,
                tierLabels: { ...data.tierLabels, [tier]: v },
              })
            }
          />
        ))}
      </SiteCard>

      <SiteCard title="Tier blurbs (home explore cards)">
        {TIERS.map((tier) => (
          <TextField
            key={tier}
            label={tier}
            value={data.tierBlurbs[tier]}
            onChange={(v) =>
              setData({
                ...data,
                tierBlurbs: { ...data.tierBlurbs, [tier]: v },
              })
            }
          />
        ))}
      </SiteCard>

      <SiteCard title="Mid-market rental carousel areas">
        <TextField
          label="Comma-separated area names"
          value={midAreasText}
          onChange={setMidAreasText}
          hint="Used to filter the popular rentals row on the home page."
        />
      </SiteCard>

      <SiteCard title="Search placeholder">
        <TextField
          label="Area autocomplete placeholder"
          value={data.areaSearchPlaceholder}
          onChange={(v) => setData({ ...data, areaSearchPlaceholder: v })}
        />
      </SiteCard>

      <SiteCard title="Catalog">
        <ul className="space-y-2">
          {data.catalog.map((area, i) => (
            <li key={`${area.name}-${i}`} className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-sm text-ink"
                value={area.name}
                onChange={(e) => {
                  const catalog = [...data.catalog]
                  catalog[i] = { ...area, name: e.target.value }
                  setData({ ...data, catalog })
                }}
              />
              <select
                className="rounded-lg border border-neutral-light bg-surface px-2 py-1.5 text-sm text-ink"
                value={area.tier}
                onChange={(e) => {
                  const catalog = [...data.catalog]
                  catalog[i] = {
                    ...area,
                    tier: e.target.value as AreaTier,
                  }
                  setData({ ...data, catalog })
                }}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {data.tierLabels[t] || t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Remove area"
                className="rounded-lg p-2 text-neutral-muted hover:bg-surface-alt hover:text-ink"
                onClick={() =>
                  setData({
                    ...data,
                    catalog: data.catalog.filter((_, j) => j !== i),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          onClick={() =>
            setData({
              ...data,
              catalog: [...data.catalog, { name: 'New area', tier: 'mid' }],
            })
          }
        >
          <Plus className="h-4 w-4" /> Add area
        </button>
      </SiteCard>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ArrowPillButton onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save areas'}
      </ArrowPillButton>
    </div>
  )
}
