'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { type AreaTier } from '@/lib/areas'
import { useAreasCatalog } from '@/components/site-catalog-provider'
import { areasGroupedFrom } from '@/lib/site-content/catalog-helpers'

/**
 * Tiered area/town autocomplete — same catalog & grouping as HeroSearch.
 */
export function AreaAutocomplete({
  value,
  onChange,
  id = 'area-autocomplete',
  placeholder,
  compact = false,
}: {
  value: string
  onChange: (name: string, tier: AreaTier | '') => void
  id?: string
  placeholder?: string
  /** Denser trigger — used in mobile Book-a-viewing-style modals only */
  compact?: boolean
}) {
  const areas = useAreasCatalog()
  const resolvedPlaceholder = placeholder ?? areas.areaSearchPlaceholder
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const grouped = useMemo(() => areasGroupedFrom(areas), [areas])

  const filteredGrouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return grouped
    const match = (name: string) => name.toLowerCase().includes(q)
    return {
      prime: grouped.prime.filter((a) => match(a.name)),
      mid: grouped.mid.filter((a) => match(a.name)),
      emerging: grouped.emerging.filter((a) => match(a.name)),
    }
  }, [grouped, query])

  const hasMatches =
    filteredGrouped.prime.length +
      filteredGrouped.mid.length +
      filteredGrouped.emerging.length >
    0

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function select(name: string, tier: AreaTier | '') {
    onChange(name, tier)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen((v) => !v)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className={
          compact
            ? 'flex w-full items-center gap-2 rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-left text-sm outline-none transition-colors focus:border-primary'
            : 'flex w-full items-center gap-2 rounded-xl border border-neutral-light bg-surface-alt px-4 py-3.5 text-left text-[15px] outline-none transition-colors focus:border-primary'
        }
      >
        <MapPin
          className={`shrink-0 text-neutral-muted ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
        />
        <span
          className={`${value ? 'text-ink' : 'text-neutral-muted'}${compact ? ' truncate' : ''}`}
        >
          {value || 'Select area / town'}
        </span>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-neutral-muted" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Areas"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-neutral-light bg-surface shadow-lg"
        >
          <div className="border-b border-neutral-light p-2.5">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-muted" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={resolvedPlaceholder}
                className="w-full rounded-xl border border-neutral-light bg-surface-alt py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-neutral-muted focus:border-primary"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {hasMatches ? (
              (['prime', 'mid', 'emerging'] as AreaTier[]).map((tier) =>
                filteredGrouped[tier].length > 0 ? (
                  <div key={tier}>
                    <p className="sticky top-0 z-[1] bg-surface-alt px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
                      {areas.tierLabels[tier]}
                    </p>
                    {filteredGrouped[tier].map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        role="option"
                        aria-selected={value === opt.name}
                        onClick={() => select(opt.name, opt.tier)}
                        className={`flex w-full px-4 py-2 text-left text-sm font-medium hover:bg-surface-alt ${
                          value === opt.name ? 'text-primary' : 'text-ink'
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                ) : null,
              )
            ) : (
              <div className="px-4 py-4">
                <p className="text-center text-sm text-neutral-muted">
                  No areas match “{query.trim()}”
                </p>
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => select(query.trim(), '')}
                    className="mt-2 w-full rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
                  >
                    Use “{query.trim()}”
                  </button>
                ) : null}
              </div>
            )}
            {!query.trim() &&
            !areas.catalog.some((a) => a.name === value) &&
            value ? (
              <p className="border-t border-neutral-light px-4 py-2 text-xs text-neutral-muted">
                Custom: {value}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
