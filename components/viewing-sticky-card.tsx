'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  formatPriceUgx,
  priceSuffix,
  type Property,
} from '@/lib/properties'
import { ViewingBookingForm } from '@/components/viewing-booking-form'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import {
  useFormsCopy,
  useViewingConfig,
  useViewingPassBlurb,
} from '@/components/site-catalog-provider'

/**
 * Desktop: sticky white card in the right column.
 * Mobile: fixed bottom bar + centered compact booking modal.
 */
export function ViewingStickyCard({
  item,
  mobileOpen: mobileOpenControlled,
  onMobileOpenChange,
}: {
  item: Property
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const controlled = onMobileOpenChange != null
  const mobileOpen = controlled ? Boolean(mobileOpenControlled) : internalOpen
  const passBlurb = useViewingPassBlurb()
  const { paymentNote } = useViewingConfig()
  const { viewing: viewingCopy } = useFormsCopy()

  function setMobileOpen(open: boolean) {
    if (controlled) onMobileOpenChange?.(open)
    else setInternalOpen(open)
  }

  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      {/* Desktop sticky card */}
      <aside className="hidden lg:block lg:sticky lg:top-24">
        <div className="rounded-2xl border border-neutral-light bg-surface p-5 shadow-[0_8px_30px_rgba(42,46,50,0.08)] sm:p-6">
          <PriceBlock item={item} />
          <LeaseBits item={item} />
          <div className="mt-5">
            <ViewingBookingForm item={item} />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-neutral-muted">
            {passBlurb}. {paymentNote}
          </p>
        </div>
      </aside>

      {/* Mobile: centered modal */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4 lg:hidden">
          <div
            role="presentation"
            aria-hidden
            className="fixed inset-0 bg-accent-deep/50"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setMobileOpen(false)
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={viewingCopy.idleTitle}
            className="relative z-[91] flex min-h-[min(520px,78vh)] w-full max-w-[360px] flex-col overflow-visible rounded-2xl bg-surface px-5 py-5 shadow-[0_16px_48px_rgba(42,46,50,0.22)]"
          >
            <div className="relative mb-3 flex items-center justify-center">
              <p className="text-center text-[15px] font-extrabold text-ink">
                {viewingCopy.idleTitle}
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setMobileOpen(false)}
                className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full text-neutral-muted transition-colors hover:bg-surface-alt hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col">
              <ViewingBookingForm
                item={item}
                defaultOpen
                compact
                onSubmitted={() => setMobileOpen(false)}
                onActiveChange={(active) => {
                  if (!active) setMobileOpen(false)
                }}
              />
            </div>
            <p className="mt-3 text-center text-[10px] leading-snug text-neutral-muted">
              {passBlurb}. {paymentNote}
            </p>
          </div>
        </div>
      ) : null}

      {/* Mobile fixed CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-neutral-light bg-surface px-4 py-3 shadow-[0_-4px_20px_rgba(42,46,50,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-ink">
              {formatPriceUgx(item.priceUgx)}
              {priceSuffix(item) ? (
                <span className="text-xs font-medium text-neutral-muted">
                  {' '}
                  {priceSuffix(item)}
                </span>
              ) : null}
            </p>
          </div>
          <ArrowPillButton
            onClick={() => setMobileOpen(true)}
            size="sm"
            className="shrink-0"
          >
            {viewingCopy.idleCta}
          </ArrowPillButton>
        </div>
      </div>
    </>
  )
}

function PriceBlock({ item }: { item: Property }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-ink sm:text-3xl">
        {formatPriceUgx(item.priceUgx)}
        {priceSuffix(item) ? (
          <span className="text-sm font-medium text-neutral-muted">
            {' '}
            {priceSuffix(item)}
          </span>
        ) : null}
      </p>
      {item.priceNegotiable ? (
        <span className="mt-2 inline-block rounded-full bg-pill-soft px-2.5 py-1 text-xs font-bold text-secondary">
          Negotiable
        </span>
      ) : null}
    </div>
  )
}

function LeaseBits({ item }: { item: Property }) {
  if (item.listingMode !== 'rent') return null
  if (!item.depositMonths && !item.leaseTerm) return null
  return (
    <dl className="mt-4 space-y-2 border-t border-neutral-light pt-4 text-sm">
      {item.depositMonths != null ? (
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-muted">Deposit</dt>
          <dd className="font-semibold text-ink">
            {item.depositMonths} month{item.depositMonths === 1 ? '' : 's'}
          </dd>
        </div>
      ) : null}
      {item.leaseTerm ? (
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-muted">Lease term</dt>
          <dd className="font-semibold text-ink">{item.leaseTerm}</dd>
        </div>
      ) : null}
    </dl>
  )
}
