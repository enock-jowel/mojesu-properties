'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { updateServiceEnquiryStatus } from '@/lib/requests/actions'
import {
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_PILL,
  type ServiceEnquiryRow,
  type ServiceEnquiryStatus,
} from '@/lib/requests/types'

const TRANSITIONS: {
  status: ServiceEnquiryStatus
  label: string
  variant?: 'primary' | 'dark'
}[] = [
  { status: 'contacted', label: 'Mark contacted', variant: 'primary' },
  { status: 'quoted', label: 'Mark quoted', variant: 'primary' },
  { status: 'won', label: 'Mark won', variant: 'primary' },
  { status: 'closed', label: 'Close', variant: 'dark' },
  { status: 'new', label: 'Reset to new', variant: 'dark' },
]

export function ServiceEnquiryDetail({
  enquiry: initial,
}: {
  enquiry: ServiceEnquiryRow
}) {
  const router = useRouter()
  const [enquiry, setEnquiry] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const briefEntries = Object.entries(enquiry.brief || {}).filter(
    ([, v]) => String(v || '').trim().length > 0,
  )

  function setStatus(status: ServiceEnquiryStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateServiceEnquiryStatus(enquiry.id, status)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEnquiry(result.data)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/requests/?tab=services"
        className="text-sm font-semibold text-neutral-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold text-ink">Service enquiry</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVICE_STATUS_PILL[enquiry.status]}`}
        >
          {SERVICE_STATUS_LABEL[enquiry.status]}
        </span>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 sm:p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Client
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Name" value={enquiry.name} />
          <div>
            <dt className="text-neutral-muted">Phone</dt>
            <dd className="font-semibold text-ink">
              <a href={`tel:${enquiry.phone}`} className="hover:underline">
                {enquiry.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-neutral-muted">Email</dt>
            <dd className="font-semibold text-ink">
              <a href={`mailto:${enquiry.email}`} className="hover:underline">
                {enquiry.email}
              </a>
            </dd>
          </div>
          <Field
            label="Submitted"
            value={new Date(enquiry.created_at).toLocaleString('en-GB')}
          />
          <Field label="Source" value={enquiry.source_path} />
        </dl>
      </section>

      <section className="mt-5 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 sm:p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Service
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Service" value={enquiry.service_name} />
          <Field label="Slug" value={enquiry.service_slug} />
          <Field label="Service id" value={enquiry.service_id} />
        </dl>
        {briefEntries.length > 0 ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {briefEntries.map(([key, value]) => (
              <Field key={key} label={key} value={String(value)} />
            ))}
          </dl>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Update status
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRANSITIONS.filter((t) => t.status !== enquiry.status).map((t) => (
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
      <dt className="text-neutral-muted capitalize">{label}</dt>
      <dd className="font-semibold text-ink">{value || '—'}</dd>
    </div>
  )
}
