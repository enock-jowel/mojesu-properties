'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowPillButton, ArrowPillLink } from '@/components/arrow-pill-button'
import { updatePropertySubmissionStatus } from '@/lib/requests/actions'
import {
  SUBMISSION_STATUS_LABEL,
  SUBMISSION_STATUS_PILL,
  type PropertySubmissionRow,
  type PropertySubmissionStatus,
} from '@/lib/requests/types'

const TRANSITIONS: {
  status: PropertySubmissionStatus
  label: string
  variant?: 'primary' | 'dark'
}[] = [
  { status: 'contacted', label: 'Mark contacted', variant: 'primary' },
  { status: 'visited', label: 'Mark visited', variant: 'primary' },
  { status: 'listed', label: 'Mark listed', variant: 'primary' },
  { status: 'declined', label: 'Decline', variant: 'dark' },
  { status: 'new', label: 'Reset to new', variant: 'dark' },
]

export function SubmissionDetail({
  submission: initial,
}: {
  submission: PropertySubmissionRow
}) {
  const router = useRouter()
  const [submission, setSubmission] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const canCreateListing =
    submission.status === 'visited' || submission.status === 'listed'

  function setStatus(status: PropertySubmissionStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updatePropertySubmissionStatus(submission.id, status)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSubmission(result.data)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/requests/?tab=submissions"
        className="text-sm font-semibold text-neutral-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold text-ink">Property submission</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SUBMISSION_STATUS_PILL[submission.status]}`}
        >
          {SUBMISSION_STATUS_LABEL[submission.status]}
        </span>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 sm:p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Owner contact
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-muted">Name</dt>
            <dd className="font-semibold text-ink">{submission.contact_name}</dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Phone</dt>
            <dd className="font-semibold text-ink">
              <a
                href={`tel:${submission.contact_phone}`}
                className="hover:underline"
              >
                {submission.contact_phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Best time</dt>
            <dd className="font-semibold text-ink">
              {submission.best_time_to_reach || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Submitted</dt>
            <dd className="font-semibold text-ink">
              {new Date(submission.submitted_at).toLocaleString('en-GB')}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 sm:p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Property details
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Mode" value={submission.listing_mode} />
          <Field label="Category" value={submission.category} />
          <Field label="Area" value={submission.area} />
          <Field label="Rough address" value={submission.rough_address} />
          <Field
            label="Bedrooms"
            value={
              submission.bedrooms != null ? String(submission.bedrooms) : null
            }
          />
          <Field
            label="Bathrooms"
            value={
              submission.bathrooms != null ? String(submission.bathrooms) : null
            }
          />
          <Field label="Plot size" value={submission.approx_plot_size} />
          <Field
            label="Floor area"
            value={
              submission.approx_floor_area != null
                ? `${submission.approx_floor_area} sqm`
                : null
            }
          />
          <Field
            label="Asking price"
            value={
              submission.asking_price != null
                ? `UGX ${Number(submission.asking_price).toLocaleString('en-UG')}`
                : 'Not sure'
            }
          />
        </dl>
      </section>

      {(submission.photo_urls || []).length > 0 ? (
        <section className="mt-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
            Photos
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(submission.photo_urls || []).map((url) => (
              <li
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-light"
              >
                <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Update status
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRANSITIONS.filter((t) => t.status !== submission.status).map((t) => (
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
      </section>

      {canCreateListing ? (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-pill-soft/50 p-4">
          <p className="text-sm font-semibold text-ink">
            Ready to turn this into a listing?
          </p>
          <p className="mt-1 text-xs text-neutral-muted">
            Prefills mode, category, area, specs, price, and any uploaded photos.
          </p>
          <div className="mt-3">
            <ArrowPillLink
              href={`/admin/listings/new/?from=${submission.id}`}
              size="sm"
            >
              Create listing from this
            </ArrowPillLink>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-xs text-neutral-muted">
          Mark as visited or listed to unlock “Create listing from this”.
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <dt className="text-neutral-muted">{label}</dt>
      <dd className="font-semibold capitalize text-ink">{value || '—'}</dd>
    </div>
  )
}
