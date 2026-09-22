'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { updateViewingBookingStatus } from '@/lib/requests/actions'
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_PILL,
  type ListingAdminRef,
  type ViewingBookingRow,
  type ViewingBookingStatus,
} from '@/lib/requests/types'

const TRANSITIONS: {
  status: ViewingBookingStatus
  label: string
  variant?: 'primary' | 'dark'
}[] = [
  { status: 'confirmed', label: 'Confirm', variant: 'primary' },
  { status: 'completed', label: 'Mark completed', variant: 'dark' },
  { status: 'declined', label: 'Decline', variant: 'dark' },
  { status: 'expired', label: 'Mark expired', variant: 'dark' },
  { status: 'requested', label: 'Reset to requested', variant: 'dark' },
]

export function BookingDetail({
  booking: initial,
  listings,
}: {
  booking: ViewingBookingRow
  listings: ListingAdminRef[]
}) {
  const router = useRouter()
  const [booking, setBooking] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function setStatus(status: ViewingBookingStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateViewingBookingStatus(booking.id, status)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setBooking(result.data)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/requests/?tab=bookings"
        className="text-sm font-semibold text-neutral-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold text-ink">Viewing booking</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BOOKING_STATUS_PILL[booking.status]}`}
        >
          {BOOKING_STATUS_LABEL[booking.status]}
        </span>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 sm:p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Client
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-muted">Name</dt>
            <dd className="font-semibold text-ink">{booking.contact_name}</dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Phone</dt>
            <dd className="font-semibold text-ink">
              <a href={`tel:${booking.contact_phone}`} className="hover:underline">
                {booking.contact_phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Email</dt>
            <dd className="font-semibold text-ink">
              {booking.contact_email || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Preferred</dt>
            <dd className="font-semibold text-ink">
              {booking.preferred_date
                ? new Date(booking.preferred_date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
              {booking.preferred_time ? ` · ${booking.preferred_time}` : ''}
            </dd>
          </div>
          {booking.confirmed_at ? (
            <div>
              <dt className="text-neutral-muted">Confirmed</dt>
              <dd className="font-semibold text-ink">
                {new Date(booking.confirmed_at).toLocaleString('en-GB')}
              </dd>
            </div>
          ) : null}
          {booking.expires_at ? (
            <div>
              <dt className="text-neutral-muted">Pass expires</dt>
              <dd className="font-semibold text-ink">
                {new Date(booking.expires_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Requested properties
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {listings.map((l) => (
            <li key={l.id}>
              <Link
                href={`/admin/listings/${l.id}/edit/`}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-light/80 bg-surface-alt/40 px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
              >
                <span className="font-semibold text-ink">{l.title}</span>
                <span className="shrink-0 text-xs font-bold uppercase text-neutral-muted">
                  {l.status}
                </span>
              </Link>
            </li>
          ))}
          {listings.length === 0 ? (
            <li className="rounded-xl border border-dashed border-neutral-light px-3 py-4 text-sm text-neutral-muted">
              No linked listings resolved for this booking
              {(booking.listing_ids || []).length
                ? ` (${booking.listing_ids.length} id(s) stored)`
                : ''}
              .
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Update status
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRANSITIONS.filter((t) => t.status !== booking.status).map((t) => (
            <ArrowPillButton
              key={t.status}
              type="button"
              size="sm"
              variant={t.variant || 'primary'}
              disabled={pending}
              onClick={() => setStatus(t.status)}
            >
              {t.label}
            </ArrowPillButton>
          ))}
        </div>
        {error ? (
          <p className="mt-3 text-sm font-semibold text-secondary">{error}</p>
        ) : null}
        <p className="mt-3 text-xs text-neutral-muted">
          Confirming sets confirmed time and pass expiry from CMS viewing
          settings (pass days). Email / WhatsApp notifications from the public
          form stay unchanged — this inbox is additive.
        </p>
      </section>
    </div>
  )
}
