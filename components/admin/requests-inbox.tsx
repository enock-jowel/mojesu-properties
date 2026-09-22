'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_PILL,
  CONTACT_STATUS_LABEL,
  CONTACT_STATUS_PILL,
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_PILL,
  SUBMISSION_STATUS_LABEL,
  SUBMISSION_STATUS_PILL,
  type ContactEnquiryRow,
  type ContactEnquiryStatus,
  type PropertySubmissionRow,
  type PropertySubmissionStatus,
  type ServiceEnquiryRow,
  type ServiceEnquiryStatus,
  type ViewingBookingRow,
  type ViewingBookingStatus,
} from '@/lib/requests/types'

type Tab = 'bookings' | 'submissions' | 'contact' | 'services'

export function RequestsInbox({
  bookings,
  submissions,
  contactEnquiries,
  serviceEnquiries,
  initialTab = 'bookings',
}: {
  bookings: ViewingBookingRow[]
  submissions: PropertySubmissionRow[]
  contactEnquiries: ContactEnquiryRow[]
  serviceEnquiries: ServiceEnquiryRow[]
  initialTab?: Tab
}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [bookingStatus, setBookingStatus] = useState<
    ViewingBookingStatus | 'all'
  >('all')
  const [submissionStatus, setSubmissionStatus] = useState<
    PropertySubmissionStatus | 'all'
  >('all')
  const [contactStatus, setContactStatus] = useState<
    ContactEnquiryStatus | 'all'
  >('all')
  const [serviceStatus, setServiceStatus] = useState<
    ServiceEnquiryStatus | 'all'
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

  const filteredContact = useMemo(() => {
    return contactEnquiries.filter((c) => {
      if (contactStatus !== 'all' && c.status !== contactStatus) return false
      const day = (c.created_at || '').slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
  }, [contactEnquiries, contactStatus, from, to])

  const filteredServices = useMemo(() => {
    return serviceEnquiries.filter((s) => {
      if (serviceStatus !== 'all' && s.status !== serviceStatus) return false
      const day = (s.created_at || '').slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
  }, [serviceEnquiries, serviceStatus, from, to])

  const selectClass =
    'rounded-lg border border-neutral-light bg-surface-alt px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary'

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Requests</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Viewing bookings, List-with-us, contact, and service enquiries
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-light/80 pb-px">
        {(
          [
            ['bookings', `Viewings (${bookings.length})`],
            ['submissions', `List with us (${submissions.length})`],
            ['contact', `Contact (${contactEnquiries.length})`],
            ['services', `Services (${serviceEnquiries.length})`],
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
        ) : null}
        {tab === 'submissions' ? (
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
        ) : null}
        {tab === 'contact' ? (
          <select
            className={selectClass}
            value={contactStatus}
            onChange={(e) =>
              setContactStatus(e.target.value as ContactEnquiryStatus | 'all')
            }
          >
            <option value="all">All statuses</option>
            {(Object.keys(CONTACT_STATUS_LABEL) as ContactEnquiryStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {CONTACT_STATUS_LABEL[s]}
                </option>
              ),
            )}
          </select>
        ) : null}
        {tab === 'services' ? (
          <select
            className={selectClass}
            value={serviceStatus}
            onChange={(e) =>
              setServiceStatus(e.target.value as ServiceEnquiryStatus | 'all')
            }
          >
            <option value="all">All statuses</option>
            {(Object.keys(SERVICE_STATUS_LABEL) as ServiceEnquiryStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {SERVICE_STATUS_LABEL[s]}
                </option>
              ),
            )}
          </select>
        ) : null}
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
      ) : null}

      {tab === 'submissions' ? (
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
      ) : null}

      {tab === 'contact' ? (
        <ul className="mt-5 flex flex-col gap-3">
          {filteredContact.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/requests/contact/${c.id}/`}
                className="block rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 transition-colors hover:border-primary/40 hover:bg-pill-soft/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{c.name}</p>
                  <StatusPill
                    className={CONTACT_STATUS_PILL[c.status]}
                    label={CONTACT_STATUS_LABEL[c.status]}
                    done={c.status === 'converted'}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-muted sm:text-sm">
                  {c.phone}
                  {c.email ? ` · ${c.email}` : ''}
                </p>
                <p className="mt-2 text-xs text-neutral-muted">
                  {c.purpose}
                  {c.location ? ` · ${c.location}` : ''}
                  {' · '}
                  {new Date(c.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </Link>
            </li>
          ))}
          {filteredContact.length === 0 ? (
            <Empty label="No contact enquiries match these filters." />
          ) : null}
        </ul>
      ) : null}

      {tab === 'services' ? (
        <ul className="mt-5 flex flex-col gap-3">
          {filteredServices.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/requests/services/${s.id}/`}
                className="block rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 transition-colors hover:border-primary/40 hover:bg-pill-soft/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{s.name}</p>
                  <StatusPill
                    className={SERVICE_STATUS_PILL[s.status]}
                    label={SERVICE_STATUS_LABEL[s.status]}
                    done={s.status === 'won'}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-muted sm:text-sm">
                  {s.phone}
                  {s.email ? ` · ${s.email}` : ''}
                </p>
                <p className="mt-2 text-xs text-neutral-muted">
                  {s.service_name}
                  {' · '}
                  {new Date(s.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </Link>
            </li>
          ))}
          {filteredServices.length === 0 ? (
            <Empty label="No service enquiries match these filters." />
          ) : null}
        </ul>
      ) : null}
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
