'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import { ContentStatusPill } from '@/components/admin/content-chrome'
import { BLOG_CATEGORY_LABEL } from '@/lib/blog'
import type { ContentStatus, InsightPostRow } from '@/lib/content/types'

export function InsightsTable({ insights }: { insights: InsightPostRow[] }) {
  const [status, setStatus] = useState<ContentStatus | 'all'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return insights.filter((row) => {
      if (status !== 'all' && row.status !== status) return false
      if (q.trim()) {
        const needle = q.trim().toLowerCase()
        if (
          !row.title.toLowerCase().includes(needle) &&
          !row.slug.toLowerCase().includes(needle)
        ) {
          return false
        }
      }
      return true
    })
  }, [insights, status, q])

  const selectClass =
    'rounded-lg border border-neutral-light bg-surface-alt px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary'

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Insights</h1>
          <p className="mt-1 text-sm text-neutral-muted">
            {filtered.length} of {insights.length} posts
          </p>
        </div>
        <ArrowPillLink href="/admin/content/insights/new/" size="sm">
          New insight
        </ArrowPillLink>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or slug…"
          className="min-w-[160px] flex-1 rounded-lg border border-neutral-light bg-surface-alt px-3 py-1.5 text-sm text-ink outline-none focus:border-primary sm:max-w-xs"
        />
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as ContentStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {filtered.map((row) => (
          <li key={row.id}>
            <Link
              href={`/admin/content/insights/${row.id}/edit/`}
              className="flex gap-3 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-3 transition-colors hover:border-primary/40 hover:bg-pill-soft/40 sm:gap-4 sm:p-4"
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-light sm:h-24 sm:w-32">
                {row.cover_image ? (
                  <Image
                    src={row.cover_image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] font-semibold text-neutral-muted">
                    No cover
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-bold text-ink sm:text-base">
                    {row.title}
                  </h2>
                  <ContentStatusPill status={row.status} />
                </div>
                <p className="mt-1 text-xs text-neutral-muted sm:text-sm">
                  {BLOG_CATEGORY_LABEL[row.category]} · {row.read_time_minutes}{' '}
                  min read
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-[11px] text-neutral-muted">
                    /{row.slug}/
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
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-neutral-light px-4 py-10 text-center text-sm text-neutral-muted">
            No insights match these filters.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
