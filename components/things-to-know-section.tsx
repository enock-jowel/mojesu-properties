'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { Property } from '@/lib/properties'
import {
  getThingsToKnow,
  type ThingsColumn,
} from '@/lib/things-to-know'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import {
  useTaxonomy,
  useViewingConfig,
} from '@/components/site-catalog-provider'

/**
 * Airbnb-style "Things to know".
 * Mobile: card per column in a horizontal carousel.
 * sm+: static multi-column layout.
 */
export function ThingsToKnowSection({ item }: { item: Property }) {
  const viewing = useViewingConfig()
  const { titleStatus } = useTaxonomy()
  const columns = useMemo(
    () => getThingsToKnow(item, { viewing, titleStatus }),
    [item, viewing, titleStatus],
  )
  const [open, setOpen] = useState<ThingsColumn | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <section className="mt-8 border-t border-neutral-light pt-6 sm:mt-14 sm:pt-10">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Things to know
        </h2>

        {/* Mobile: horizontal card carousel */}
        <div className="allow-x-scroll mt-4 flex max-w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:mt-6 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex w-[calc(100%-1.75rem)] shrink-0 snap-start flex-col rounded-2xl border border-neutral-light bg-surface p-4 shadow-sm"
            >
              <h3 className="text-[15px] font-extrabold text-ink">
                {col.title}
              </h3>
              <ul className="mt-3 flex-1 space-y-2">
                {col.items.map((line) => (
                  <li
                    key={line}
                    className="text-[13px] leading-snug text-neutral-muted"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <ArrowPillButton
                type="button"
                onClick={() => setOpen(col)}
                size="sm"
                variant="dark"
                className="mt-4"
              >
                Learn more
              </ArrowPillButton>
            </div>
          ))}
        </div>

        {/* Desktop / tablet grid */}
        <div className="mt-8 hidden gap-10 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {columns.map((col) => (
            <div key={col.id}>
              <h3 className="text-[15px] font-extrabold text-ink">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((line) => (
                  <li
                    key={line}
                    className="text-[15px] leading-snug text-neutral-muted"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <ArrowPillButton
                type="button"
                onClick={() => setOpen(col)}
                size="sm"
                variant="dark"
                className="mt-4"
              >
                Learn more
              </ArrowPillButton>
            </div>
          ))}
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            role="presentation"
            aria-hidden
            className="fixed inset-0 bg-accent-deep/50"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(null)
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="things-know-title"
            className="relative z-[101] w-full max-w-[340px] overflow-hidden rounded-2xl bg-surface text-center shadow-[0_16px_48px_rgba(42,46,50,0.22)]"
          >
            <div className="relative border-b border-primary/10 bg-gradient-to-br from-pill-soft via-pill-soft-mid to-surface px-4 pb-3 pt-3.5">
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-neutral-muted transition-colors hover:bg-surface/80 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex flex-col items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mojesu-logo-final.png"
                  alt=""
                  className="h-8 w-8 object-contain"
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Mojesu
                </p>
                <h2
                  id="things-know-title"
                  className="max-w-[260px] text-[15px] font-extrabold leading-snug text-ink"
                >
                  {open.title}
                </h2>
              </div>
            </div>
            <ul className="space-y-2.5 px-4 py-3.5">
              {open.details.map((line) => (
                <li
                  key={line}
                  className="text-[13px] leading-snug text-neutral-muted"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
