'use client'

import { fieldClass, Label } from '@/components/admin/content-chrome'

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  hint,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'url' | 'email' | 'tel'
  hint?: string
  required?: boolean
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {hint ? (
        <p className="mt-1 text-[11px] text-neutral-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  hint?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        className={`${fieldClass} resize-y`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? (
        <p className="mt-1 text-[11px] text-neutral-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function SiteCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-neutral-light/80 bg-surface-alt/30 p-5">
      <h2 className="mb-4 text-sm font-extrabold text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
