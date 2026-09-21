'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_PILL,
  SUBMISSION_STATUS_LABEL,
  SUBMISSION_STATUS_PILL,
  type PropertySubmissionRow,
  type PropertySubmissionStatus,
  type ViewingBookingRow,
  type ViewingBookingStatus,
} from '@/lib/requests/types'

type Tab = 'bookings' | 'submissions'

export function RequestsInbox({
  bookings,
  submissions,
  initialTab = 'bookings',
}: {
  bookings: ViewingBookingRow[]
  submissions: PropertySubmissionRow[]
  initialTab?: Tab
}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [bookingStatus, setBookingStatus] = useState<
    ViewingBookingStatus | 'all'
  >('all')
  const [submissionStatus, setSubmissionStatus] = useState<
    PropertySubmissionStatus | 'all'
  >('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingStatus !== 'all' && b.status !== bookingStatus) return false
      const day = (b.requested_at || '').slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
  }, [bookings, bookingStatus, from, to])

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (submissionStatus !== 'all' && s.status !== submissionStatus)
        return false
      const day = (s.submitted_at || '').slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
  }, [submissions, submissionStatus, from, to])

  const selectClass =
    'rounded-lg border border-neutral-light bg-surface-alt px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary'

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Requests</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Viewing bookings and List-with-us submissions
        </p>
      </div>

      <div className="flex gap-2 border-b border-neutral-light/80 pb-px">
        {(
          [
            ['bookings', `Viewing bookings (${bookings.length})`],
            ['submissions', `Property submissions (${submissions.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === id
                ? 'border-primary text-ink'
                : 'border-transparent text-neutral-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tab === 'bookings' ? (
          <select
            className={selectClass}
            value={bookingStatus}
            onChange={(e) =>
              setBookingStatus(e.target.value as ViewingBookingStatus | 'all')
            }
          >
            <option value="all">All statuses</option>
            {(
              Object.keys(BOOKING_STATUS_LABEL) as ViewingBookingStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        ) : (
          <select
            className={selectClass}
            value={submissionStatus}
            onChange={(e) =>
              setSubmissionStatus(
                e.target.value as PropertySubmissionStatus | 'all',
              )
            }
          >
            <option value="all">All statuses</option>
            {(
              Object.keys(SUBMISSION_STATUS_LABEL) as PropertySubmissionStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {SUBMISSION_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        )}
        <input
          type="date"
          className={selectClass}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="From date"
        />
        <input
          type="date"
          className={selectClass}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label="To date"
        />
      </div>

      {tab === 'bookings' ? (
        <ul className="mt-5 flex flex-col gap-3">
          {filteredBookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/requests/bookings/${b.id}/`}
                className="block rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 transition-colors hover:border-primary/40 hover:bg-pill-soft/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{b.contact_name}</p>
                  <StatusPill
                    className={BOOKING_STATUS_PILL[b.status]}
                    label={BOOKING_STATUS_LABEL[b.status]}
                    done={b.status === 'completed'}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-muted sm:text-sm">
                  {b.contact_phone}
                  {b.contact_email ? ` · ${b.contact_email}` : ''}
                </p>
                <p className="mt-2 text-xs text-neutral-muted">
                  Preferred{' '}
                  {b.preferred_date
                    ? new Date(b.preferred_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                  {b.preferred_time ? ` · ${b.preferred_time}` : ''}
                  {' · '}
                  {(b.listing_ids || []).length} propert
                  {(b.listing_ids || []).length === 1 ? 'y' : 'ies'}
                  {' · '}
                  {new Date(b.requested_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </Link>
            </li>
          ))}
          {filteredBookings.length === 0 ? (
            <Empty label="No viewing bookings match these filters." />
          ) : null}
        </ul>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {filteredSubmissions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/requests/submissions/${s.id}/`}
                className="block rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 transition-colors hover:border-primary/40 hover:bg-pill-soft/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{s.contact_name}</p>
                  <StatusPill
                    className={SUBMISSION_STATUS_PILL[s.status]}
                    label={SUBMISSION_STATUS_LABEL[s.status]}
                    done={s.status === 'listed'}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-muted sm:text-sm">
                  {s.contact_phone}
                  {s.area ? ` · ${s.area}` : ''}
                  {s.listing_mode ? ` · ${s.listing_mode}` : ''}
                  {s.category ? ` · ${s.category}` : ''}
                </p>
                <p className="mt-2 text-xs text-neutral-muted">
                  {(s.photo_urls || []).length} photo
                  {(s.photo_urls || []).length === 1 ? '' : 's'}
                  {s.asking_price != null
                    ? ` · UGX ${Number(s.asking_price).toLocaleString('en-UG')}`
                    : ' · price TBD'}
                  {' · '}
                  {new Date(s.submitted_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </Link>
            </li>
          ))}
          {filteredSubmissions.length === 0 ? (
            <Empty label="No property submissions match these filters." />
          ) : null}
        </ul>
      )}
    </div>
  )
}

function StatusPill({
  className,
  label,
  done,
}: {
  className: string
  label: string
  done?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`}
    >
      {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
      {label}
    </span>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <li className="rounded-2xl border border-dashed border-neutral-light px-4 py-10 text-center text-sm text-neutral-muted">
      {label}
    </li>
  )
}
