'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import {
  CATEGORY_LABEL,
  formatPriceLabel,
} from '@/lib/listings/map'
import type { CmsCategory, CmsStatus, ListingRow } from '@/lib/listings/types'

const STATUS_PILL: Record<CmsStatus, string> = {
  draft: 'bg-pill-soft text-secondary',
  published: 'bg-pill-soft-cool text-accent-deep',
  archived: 'bg-pill-soft-mid text-neutral-muted',
}

function coverUrl(row: ListingRow): string | null {
  const imgs = [...(row.listing_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )
  const cover = imgs.find((i) => i.is_cover) || imgs[0]
  return cover?.url ?? null
}

export function ListingsTable({
  listings,
  initialStatus = 'all',
  initialCategory = 'all',
  initialMode = 'all',
  initialArea = 'all',
}: {
  listings: ListingRow[]
  initialStatus?: CmsStatus | 'all'
  initialCategory?: CmsCategory | 'all'
  initialMode?: 'rent' | 'sale' | 'all'
  initialArea?: string
}) {
  const [status, setStatus] = useState<CmsStatus | 'all'>(initialStatus)
  const [category, setCategory] = useState<CmsCategory | 'all'>(initialCategory)
  const [mode, setMode] = useState<'rent' | 'sale' | 'all'>(initialMode)
  const [area, setArea] = useState(initialArea)
  const [q, setQ] = useState('')

  const areas = useMemo(
    () => [...new Set(listings.map((l) => l.area))].sort(),
    [listings],
  )

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (status !== 'all' && l.status !== status) return false
      if (category !== 'all' && l.category !== category) return false
      if (mode !== 'all' && l.listing_mode !== mode) return false
      if (area !== 'all' && l.area !== area) return false
      if (q.trim()) {
        const needle = q.trim().toLowerCase()
        if (!l.title.toLowerCase().includes(needle)) return false
      }
      return true
    })
  }, [listings, status, category, mode, area, q])

  const selectClass =
    'rounded-lg border border-neutral-light bg-surface-alt px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary'

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Listings</h1>
          <p className="mt-1 text-sm text-neutral-muted">
            {filtered.length} of {listings.length} listings
          </p>
        </div>
        <ArrowPillLink href="/admin/listings/new/" size="sm">
          New listing
        </ArrowPillLink>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title…"
          className="min-w-[160px] flex-1 rounded-lg border border-neutral-light bg-surface-alt px-3 py-1.5 text-sm text-ink outline-none focus:border-primary sm:max-w-xs"
        />
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as CmsStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as CmsCategory | 'all')}
        >
          <option value="all">All categories</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
        <select
          className={selectClass}
          value={mode}
          onChange={(e) => setMode(e.target.value as 'rent' | 'sale' | 'all')}
        >
          <option value="all">Rent & sale</option>
          <option value="rent">Rent</option>
          <option value="sale">Sale</option>
        </select>
        <select
          className={selectClass}
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {filtered.map((row) => {
          const cover = coverUrl(row)
          return (
            <li key={row.id}>
              <Link
                href={`/admin/listings/${row.id}/edit/`}
                className="flex gap-3 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-3 transition-colors hover:border-primary/40 hover:bg-pill-soft/40 sm:gap-4 sm:p-4"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-light sm:h-24 sm:w-32">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-semibold text-neutral-muted">
                      No photo
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-bold text-ink sm:text-base">
                      {row.title}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_PILL[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-muted sm:text-sm">
                    {CATEGORY_LABEL[row.category]} ·{' '}
                    {row.listing_mode === 'rent' ? 'For rent' : 'For sale'} ·{' '}
                    {row.area}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {formatPriceLabel(row.price, row.listing_mode)}
                    </p>
                    <p className="text-[11px] text-neutral-muted">
                      Updated{' '}
                      {new Date(row.updated_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-neutral-light px-4 py-10 text-center text-sm text-neutral-muted">
            No listings match these filters.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
