'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Property } from '@/lib/properties'
import { formatPreferredDate } from '@/lib/viewing-bookings'
import { submitViewingBookingClient } from '@/lib/viewing-bookings/client-submit'
import { BookingConfirmation } from '@/components/booking-confirmation'
import { showToast } from '@/lib/toast'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import {
  useFormsCopy,
  useViewingConfig,
  useViewingPassBlurb,
} from '@/components/site-catalog-provider'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

/** Local YYYY-MM-DD — avoids UTC shift from toISOString(). */
function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocalIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/**
 * In-form month calendar — avoids native date pickers that flash open/closed
 * inside fixed modals (focus + overflow conflict).
 */
function InlineDateCalendar({
  value,
  min,
  onChange,
  compact = false,
}: {
  value: string
  min: string
  onChange: (iso: string) => void
  compact?: boolean
}) {
  const minDate = parseLocalIsoDate(min)
  const selected = value ? parseLocalIsoDate(value) : null

  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const out: (number | null)[] = []
    for (let i = 0; i < firstDow; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) out.push(d)
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [viewMonth])

  const monthLabel = viewMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const canGoPrev = (() => {
    const prev = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    return prev >= minMonth
  })()

  return (
    <div
      className={`rounded-xl border border-neutral-light bg-surface-alt ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canGoPrev}
          onClick={() =>
            setViewMonth(
              (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <p
          className={`text-center font-bold text-ink ${
            compact ? 'text-[13px]' : 'text-sm'
          }`}
        >
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            setViewMonth(
              (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface"
        >
          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className={`py-1 text-center font-semibold text-neutral-muted ${
              compact ? 'text-[10px]' : 'text-[10px]'
            }`}
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day == null) {
            return <span key={`e-${i}`} className={compact ? 'h-8' : 'h-7'} />
          }
          const date = new Date(
            viewMonth.getFullYear(),
            viewMonth.getMonth(),
            day,
            12,
            0,
            0,
            0,
          )
          const iso = toLocalIsoDate(date)
          const disabled = date < minDate
          const isSelected = value === iso
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`flex items-center justify-center rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${
                compact ? 'h-8 text-xs' : 'h-7 text-xs'
              } ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'text-ink hover:bg-surface'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type Step = 'idle' | 'schedule' | 'details' | 'review'

type BookingForm = {
  name: string
  date: string
  time: string
  phone: string
  email: string
}

const EMPTY_FORM: BookingForm = {
  name: '',
  date: '',
  time: '',
  phone: '',
  email: '',
}

const STEPS: Step[] = ['schedule', 'details', 'review']

/**
 * Compact multi-step booking: schedule → contact → confirm.
 */
export function ViewingBookingForm({
  item,
  defaultOpen = false,
  compact = false,
  onSubmitted,
  onActiveChange,
}: {
  item: Property
  defaultOpen?: boolean
  /** Denser controls for the centered mobile modal */
  compact?: boolean
  onSubmitted?: () => void
  onActiveChange?: (active: boolean) => void
}) {
  const { viewing: copy } = useFormsCopy()
  const passBlurb = useViewingPassBlurb()
  const viewing = useViewingConfig()
  const { paymentNote } = viewing
  const stepTitle: Record<Exclude<Step, 'idle'>, string> = {
    schedule: copy.steps.step1,
    details: copy.steps.step2,
    review: copy.steps.step3,
  }

  const [form, setForm] = useState<BookingForm>(EMPTY_FORM)
  const [step, setStep] = useState<Step>(defaultOpen ? 'schedule' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    clientName: string
    preferredDateLabel: string
    propertyTitles: string[]
    whatsappUrl: string | null
    emailSent: boolean
  } | null>(null)

  const minDate = useMemo(() => toLocalIsoDate(new Date()), [])
  const stepIndex = STEPS.indexOf(step as Exclude<Step, 'idle'>)

  const fieldClass = compact
    ? 'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'
    : 'w-full rounded-xl border border-neutral-light bg-surface-alt px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary'

  const pillClass = (active: boolean) =>
    compact
      ? `rounded-lg border px-2 py-1 text-[11px] font-semibold leading-none transition-colors ${
          active
            ? 'border-primary bg-primary text-white'
            : 'border-neutral-light bg-surface-alt text-neutral-muted hover:border-primary hover:text-ink'
        }`
      : `rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
          active
            ? 'border-primary bg-primary text-white'
            : 'border-neutral-light bg-surface-alt text-neutral-muted hover:border-primary hover:text-ink'
        }`

  function go(next: Step) {
    setError(null)
    setStep(next)
    if (next !== 'idle') onActiveChange?.(true)
  }

  function cancelFlow() {
    setError(null)
    setStep('idle')
    setForm(EMPTY_FORM)
    onActiveChange?.(false)
  }

  function validateCurrent(): boolean {
    if (step === 'schedule') {
      if (!form.date) {
        setError(copy.errors.date)
        return false
      }
      if (!form.time) {
        setError(copy.errors.time)
        return false
      }
    }
    if (step === 'details') {
      if (form.name.trim().length < 2) {
        setError(copy.errors.name)
        return false
      }
      if (!/^[+]?[\d\s()-]{7,}$/.test(form.phone.trim())) {
        setError(copy.errors.phone)
        return false
      }
      const email = form.email.trim()
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(copy.errors.email)
        return false
      }
    }
    setError(null)
    return true
  }

  function nextStep() {
    if (!validateCurrent()) return
    const i = STEPS.indexOf(step as Exclude<Step, 'idle'>)
    if (i < 0 || i >= STEPS.length - 1) return
    go(STEPS[i + 1])
  }

  function prevStep() {
    setError(null)
    const i = STEPS.indexOf(step as Exclude<Step, 'idle'>)
    if (i <= 0) {
      cancelFlow()
      return
    }
    go(STEPS[i - 1])
  }

  async function confirmBooking() {
    if (!validateCurrent()) return
    setSubmitting(true)
    try {
      const result = await submitViewingBookingClient(
        {
          listingIds: [item.id],
          preferredDate: form.date,
          preferredTime: form.time,
          contactName: form.name.trim(),
          contactPhone: form.phone.trim(),
          contactEmail: form.email.trim(),
        },
        [item],
        viewing.feeUgx,
      )

      if (!result.ok) {
        setError(
          result.error ||
            'Could not save your booking. You can still WhatsApp us.',
        )
        return
      }

      setConfirmation({
        clientName: form.name.trim(),
        preferredDateLabel: `${formatPreferredDate(form.date)} · ${form.time}`,
        propertyTitles: [item.title],
        whatsappUrl: result.whatsappUrl ?? null,
        emailSent: Boolean(result.emailSent),
      })
      setStep('idle')
      setForm(EMPTY_FORM)
    } catch {
      showToast(
        'Something went wrong. Please try again or WhatsApp us directly.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'idle') {
    return (
      <>
        {!confirmation ? (
          <ArrowPillButton onClick={() => go('schedule')} size={compact ? 'sm' : 'lg'}>
            {copy.idleCta}
          </ArrowPillButton>
        ) : null}
        {confirmation ? (
          <BookingConfirmation
            {...confirmation}
            onClose={() => {
              setConfirmation(null)
              onSubmitted?.()
              onActiveChange?.(false)
            }}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      <div
        className={
          compact
            ? 'flex flex-1 flex-col overflow-visible text-center'
            : 'overflow-visible'
        }
      >
        <div
          className={`flex items-center justify-between gap-2 ${
            compact ? 'mb-3' : 'mb-4 gap-3'
          }`}
        >
          <button
            type="button"
            onClick={prevStep}
            aria-label="Back"
            className={`flex items-center justify-center rounded-full text-neutral-muted transition-colors hover:bg-surface-alt hover:text-ink ${
              compact ? 'h-7 w-7' : 'h-8 w-8'
            }`}
          >
            <ArrowLeft className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
          <div className={`flex flex-1 items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`flex-1 rounded-full transition-colors duration-300 ${
                  compact ? 'h-0.5' : 'h-1'
                } ${i <= stepIndex ? 'bg-primary' : 'bg-neutral-light'}`}
              />
            ))}
          </div>
          <span
            className={`text-right font-semibold text-neutral-muted ${
              compact ? 'w-7 text-[10px]' : 'w-8 text-[11px]'
            }`}
          >
            {stepIndex + 1}/{STEPS.length}
          </span>
        </div>

        <p
          className={`font-extrabold text-ink ${
            compact ? 'mb-3 text-sm' : 'mb-3 text-sm'
          }`}
        >
          {stepTitle[step]}
        </p>

        <div
          key={step}
          className={`${compact ? 'flex flex-1 flex-col' : ''} ${
            step === 'schedule' ? '' : 'animate-card-in'
          }`}
          style={step === 'schedule' ? undefined : { animationDelay: '0s' }}
        >
          {step === 'schedule' ? (
            <div
              className={
                compact ? 'flex flex-1 flex-col space-y-3' : 'space-y-4'
              }
            >
              <div>
                <label
                  className={`mb-1.5 block font-semibold uppercase tracking-wide text-neutral-muted ${
                    compact ? 'text-[10px]' : 'mb-1.5 text-xs'
                  }`}
                >
                  Date
                  {form.date ? (
                    <span className="ml-1.5 font-bold normal-case tracking-normal text-ink">
                      · {formatPreferredDate(form.date)}
                    </span>
                  ) : null}
                </label>
                <InlineDateCalendar
                  value={form.date}
                  min={minDate}
                  compact={compact}
                  onChange={(iso) => setForm((f) => ({ ...f, date: iso }))}
                />
              </div>
              <div className={compact ? 'mt-auto' : undefined}>
                <label
                  className={`mb-1.5 block font-semibold uppercase tracking-wide text-neutral-muted ${
                    compact ? 'text-[10px]' : 'text-xs'
                  }`}
                >
                  Time
                </label>
                <div
                  className={`grid gap-1.5 ${
                    compact ? 'mx-auto max-w-[280px] grid-cols-3' : 'grid-cols-2 gap-2'
                  }`}
                >
                  {copy.timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, time: slot }))}
                      className={pillClass(form.time === slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 'details' ? (
            <div
              className={
                compact
                  ? 'mx-auto flex w-full max-w-[280px] flex-1 flex-col justify-center space-y-2.5 text-left'
                  : 'space-y-3'
              }
            >
              <input
                type="text"
                autoComplete="name"
                autoFocus
                placeholder={copy.placeholders.name}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={`${fieldClass} text-center`}
              />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={copy.placeholders.phone}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className={`${fieldClass} text-center`}
              />
              <div>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={copy.placeholders.email}
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      nextStep()
                    }
                  }}
                  className={`${fieldClass} text-center`}
                />
                <p
                  className={`text-neutral-muted ${
                    compact
                      ? 'mt-1.5 text-center text-[10px]'
                      : 'mt-1.5 text-[11px]'
                  }`}
                >
                  Optional — WhatsApp is enough to confirm.
                </p>
              </div>
            </div>
          ) : null}

          {step === 'review' ? (
            <div
              className={`overflow-hidden border border-primary/15 bg-gradient-to-br from-pill-soft via-pill-soft-mid to-surface ${
                compact
                  ? 'mx-auto w-full max-w-[300px] flex-1 rounded-xl'
                  : 'rounded-2xl'
              }`}
            >
              <div
                className={`flex items-center gap-2 border-b border-primary/10 ${
                  compact
                    ? 'justify-center px-3 py-2'
                    : 'px-4 py-2.5'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mojesu-logo-final.png"
                  alt=""
                  className={compact ? 'h-5 w-5 object-contain' : 'h-6 w-6 object-contain'}
                />
                <span
                  className={`font-extrabold tracking-tight text-ink ${
                    compact ? 'text-[11px]' : 'text-xs'
                  }`}
                >
                  Mojesu viewing pass
                </span>
              </div>
              <div
                className={`leading-snug text-ink ${
                  compact
                    ? 'space-y-2.5 px-3 py-3.5 text-center text-[13px]'
                    : 'space-y-3 px-4 py-3.5 text-sm leading-relaxed'
                }`}
              >
                <p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                    When
                  </span>
                  <br />
                  <strong>
                    {formatPreferredDate(form.date)} · {form.time}
                  </strong>
                </p>
                <p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                    Contact
                  </span>
                  <br />
                  <strong>{form.name.trim()}</strong>
                  <br />
                  {form.phone.trim()}
                  {form.email.trim() ? (
                    <>
                      <br />
                      {form.email.trim()}
                    </>
                  ) : null}
                </p>
                {!compact ? (
                  <p className="rounded-xl bg-surface/80 px-3 py-2 text-xs text-neutral-muted">
                    {passBlurb}. {paymentNote}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            className={`font-medium text-secondary ${
              compact ? 'mt-2 text-center text-[11px]' : 'mt-2 text-xs'
            }`}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className={compact ? 'mt-4 flex justify-center' : undefined}>
          <ArrowPillButton
            disabled={submitting}
            onClick={() => {
              if (step === 'review') void confirmBooking()
              else nextStep()
            }}
            size="sm"
            className={compact ? undefined : 'mt-4'}
          >
            {step === 'review'
              ? submitting
                ? copy.sendingLabel
                : copy.confirmBooking
              : 'Continue'}
          </ArrowPillButton>
        </div>
      </div>

      {confirmation ? (
        <BookingConfirmation
          {...confirmation}
          onClose={() => setConfirmation(null)}
        />
      ) : null}
    </>
  )
}
