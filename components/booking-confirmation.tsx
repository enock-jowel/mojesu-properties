'use client'

import { Check, X } from 'lucide-react'
import { SiteLogo } from '@/components/site-logo'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import {
  useViewingConfig,
  useViewingPassBlurb,
} from '@/components/site-catalog-provider'

export function BookingConfirmation({
  clientName,
  preferredDateLabel,
  propertyTitles,
  whatsappUrl,
  emailSent,
  onClose,
}: {
  clientName: string
  preferredDateLabel: string
  propertyTitles: string[]
  whatsappUrl: string | null
  emailSent: boolean
  onClose: () => void
}) {
  const passBlurb = useViewingPassBlurb()
  const viewing = useViewingConfig()

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-accent-deep/55 p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-confirm-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-xl"
      >
        {/* Brand header */}
        <div className="bg-gradient-to-br from-pill-soft via-pill-soft-mid to-pill-soft-cool px-6 pb-5 pt-6 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-light/80 bg-surface/90 text-ink transition-colors hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>

          <SiteLogo
            markClassName="h-9 w-9"
            wordmarkClassName="text-xl font-extrabold tracking-tight text-ink"
          />

          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h2
                id="booking-confirm-title"
                className="text-xl font-extrabold text-ink sm:text-2xl"
              >
                {viewing.confirmTitle}
              </h2>
              <p className="text-sm text-neutral-muted">
                {viewing.confirmSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:pb-8">
          <p className="text-[15px] leading-relaxed text-neutral-muted">
            Thanks{clientName ? `, ${clientName}` : ''}. We logged your request for{' '}
            <strong className="text-ink">{preferredDateLabel}</strong>
            {propertyTitles.length === 1
              ? ` — ${propertyTitles[0]}`
              : ` across ${propertyTitles.length} properties`}
            .
          </p>

          <p className="mt-4 rounded-2xl border border-primary/20 bg-pill-soft px-4 py-3 text-sm text-ink">
            {passBlurb}. {viewing.paymentNote}
          </p>

          {emailSent ? (
            <p className="mt-3 text-sm text-neutral-muted">
              Manager notified by email.
            </p>
          ) : null}

          {whatsappUrl ? (
            <ArrowPillLink
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="mt-6"
            >
              Confirm on WhatsApp
            </ArrowPillLink>
          ) : (
            <p className="mt-6 text-sm text-neutral-muted">
              WhatsApp is not configured. Set{' '}
              <code className="text-ink">NEXT_PUBLIC_WHATSAPP_NUMBER</code> in
              `.env.local`.
            </p>
          )}

          <p className="mt-3 text-center text-xs text-neutral-muted">
            Opens WhatsApp with booking details ready — review and tap Send.
            No Business API required.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-full border border-neutral-light px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
