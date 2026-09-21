'use client'

import { ArrowLeft } from 'lucide-react'

const fieldClass =
  'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'

export { fieldClass }

export function ContentStepHeader({
  title,
  stepIndex,
  stepCount,
  onBack,
}: {
  title: string
  stepIndex: number
  stepCount: number
  onBack?: () => void
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {stepIndex > 0 && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-neutral-muted transition-colors hover:bg-surface-alt hover:text-ink"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex gap-1">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= stepIndex ? 'bg-primary' : 'bg-neutral-light'
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <h1 className="text-lg font-extrabold text-ink sm:text-xl">{title}</h1>
          <span className="text-xs font-semibold text-neutral-muted">
            {stepIndex + 1}/{stepCount}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ContentStatusPill({ status }: { status: string }) {
  const cls =
    status === 'published'
      ? 'bg-pill-soft-cool text-accent-deep'
      : 'bg-pill-soft text-secondary'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  )
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
      {children}
    </label>
  )
}
