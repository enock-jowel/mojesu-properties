'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import type { ServiceDetail } from '@/lib/services'
import { showToast } from '@/lib/toast'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { submitServiceEnquiryClient } from '@/lib/service-enquiries'

type Step = 'idle' | 'brief' | 'details' | 'review'

type ContactForm = {
  name: string
  email: string
  phone: string
}

const EMPTY_CONTACT: ContactForm = { name: '', email: '', phone: '' }

const STEPS: Step[] = ['brief', 'details', 'review']

/**
 * Multi-step service enquiry — same card concept as Book a viewing:
 * idle CTA → brief (service-specific) → contact (name, email, phone) → review.
 */
export function ServiceEnquiryForm({
  service,
  defaultOpen = false,
  compact = false,
  onSubmitted,
  onActiveChange,
}: {
  service: ServiceDetail
  defaultOpen?: boolean
  /** Denser controls for the centered mobile modal */
  compact?: boolean
  onSubmitted?: () => void
  onActiveChange?: (active: boolean) => void
}) {
  const { enquiry } = service
  const [step, setStep] = useState<Step>(defaultOpen ? 'brief' : 'idle')
  const [brief, setBrief] = useState<Record<string, string>>({})
  const [contact, setContact] = useState<ContactForm>(EMPTY_CONTACT)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const stepIndex = STEPS.indexOf(step as Exclude<Step, 'idle'>)

  const stepTitle = useMemo(() => {
    if (step === 'brief') return enquiry.briefStepTitle
    if (step === 'details') return 'Your details'
    if (step === 'review') return 'Confirm enquiry'
    return ''
  }, [step, enquiry.briefStepTitle])

  const fieldClass = compact
    ? 'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'
    : 'w-full rounded-xl border border-neutral-light bg-surface-alt px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary'

  const pillClass = (active: boolean) =>
    compact
      ? `rounded-lg border px-2 py-1.5 text-[11px] font-semibold leading-tight transition-colors ${
          active
            ? 'border-primary bg-primary text-white'
            : 'border-neutral-light bg-surface-alt text-neutral-muted hover:border-primary hover:text-ink'
        }`
      : `rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
          active
            ? 'border-primary bg-primary text-white'
            : 'border-black/15 bg-white text-ink shadow-sm hover:border-primary'
        }`

  const labelClass = compact
    ? 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted'
    : 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-muted'

  useEffect(() => {
    setStep(defaultOpen ? 'brief' : 'idle')
    setBrief({})
    setContact(EMPTY_CONTACT)
    setError(null)
    setDone(false)
  }, [service.id, defaultOpen])

  function go(next: Step) {
    setError(null)
    setStep(next)
    if (next !== 'idle') onActiveChange?.(true)
  }

  function cancelFlow() {
    setError(null)
    setStep('idle')
    setBrief({})
    setContact(EMPTY_CONTACT)
    onActiveChange?.(false)
  }

  function validateCurrent(): boolean {
    if (step === 'brief') {
      for (const field of enquiry.fields) {
        if (field.required === false) continue
        const value = (brief[field.id] ?? '').trim()
        if (!value) {
          setError(`Please complete: ${field.label}`)
          return false
        }
      }
    }
    if (step === 'details') {
      if (contact.name.trim().length < 2) {
        setError('Enter your full name')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
        setError('Enter a valid email')
        return false
      }
      if (!/^[+]?[\d\s()-]{7,}$/.test(contact.phone.trim())) {
        setError('Enter a valid phone number')
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

  async function confirmEnquiry() {
    if (!validateCurrent()) return
    setSubmitting(true)
    try {
      const result = await submitServiceEnquiryClient({
        serviceId: service.id,
        serviceSlug: service.slug,
        serviceName: service.name,
        brief,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      })
      if (!result.ok) {
        setError(result.error || 'Could not send. Please try again.')
        return
      }
      showToast('Enquiry sent — we’ll reply within one business day.')
      setDone(true)
      setStep('idle')
      setBrief({})
      setContact(EMPTY_CONTACT)
      onSubmitted?.()
      onActiveChange?.(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'idle') {
    return (
      <div>
        {!done ? (
          <ArrowPillButton
            onClick={() => go('brief')}
            size={compact ? 'sm' : 'lg'}
          >
            {enquiry.ctaLabel}
          </ArrowPillButton>
        ) : (
          <div
            className={`border border-primary/15 bg-gradient-to-br from-pill-soft via-pill-soft-mid to-surface ${
              compact
                ? 'rounded-xl px-3 py-3'
                : 'rounded-2xl px-4 py-4'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={compact ? 'text-center' : undefined}>
                <p className="text-sm font-extrabold text-ink">Enquiry sent</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-muted">
                  We’ll contact you by email or phone within one business day.
                </p>
              </div>
              {!compact ? (
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => {
                    setDone(false)
                    onActiveChange?.(false)
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-muted hover:bg-surface hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className={compact ? 'mt-3 flex justify-center' : undefined}>
              <button
                type="button"
                onClick={() => {
                  setDone(false)
                  go('brief')
                }}
                className={
                  compact
                    ? 'mt-0 rounded-full border border-neutral-light bg-surface px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-primary'
                    : 'mt-3 w-full rounded-full border border-neutral-light bg-surface px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-primary'
                }
              >
                Send another enquiry
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={
        compact
          ? 'flex flex-1 flex-col overflow-visible text-center'
          : 'overflow-hidden'
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
        <div
          className={`flex flex-1 items-center ${compact ? 'gap-1' : 'gap-1.5'}`}
        >
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
        {stepTitle}
      </p>

      <div
        key={step}
        className={`${compact ? 'flex flex-1 flex-col' : 'min-h-[140px]'} ${
          step === 'brief' ? '' : 'animate-card-in'
        }`}
        style={step === 'brief' ? undefined : { animationDelay: '0s' }}
      >
        {step === 'brief' ? (
          <div
            className={
              compact
                ? 'mx-auto flex w-full max-w-[280px] flex-1 flex-col justify-center space-y-3 text-left'
                : 'space-y-4'
            }
          >
            {enquiry.fields.map((field) => (
              <div key={field.id}>
                <label className={labelClass}>{field.label}</label>
                {field.type === 'choice' && field.options ? (
                  <div
                    className={`grid gap-1.5 ${
                      compact ? 'grid-cols-2' : 'grid-cols-2 gap-2'
                    }`}
                  >
                    {field.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setBrief((b) => ({ ...b, [field.id]: option }))
                        }
                        className={pillClass(brief[field.id] === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={brief[field.id] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setBrief((b) => ({ ...b, [field.id]: e.target.value }))
                    }
                    className={`${fieldClass}${compact ? ' text-center' : ''}`}
                  />
                )}
              </div>
            ))}
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
              placeholder="Full name"
              value={contact.name}
              onChange={(e) =>
                setContact((c) => ({ ...c, name: e.target.value }))
              }
              className={`${fieldClass}${compact ? ' text-center' : ''}`}
            />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              value={contact.email}
              onChange={(e) =>
                setContact((c) => ({ ...c, email: e.target.value }))
              }
              className={`${fieldClass}${compact ? ' text-center' : ''}`}
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone number"
              value={contact.phone}
              onChange={(e) =>
                setContact((c) => ({ ...c, phone: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  nextStep()
                }
              }}
              className={`${fieldClass}${compact ? ' text-center' : ''}`}
            />
            <p
              className={`text-neutral-muted ${
                compact
                  ? 'text-center text-[10px]'
                  : 'text-[11px]'
              }`}
            >
              We’ll reach you by email or phone — no WhatsApp required.
            </p>
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
                compact ? 'justify-center px-3 py-2' : 'px-4 py-2.5'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mojesu-logo-final.png"
                alt=""
                className={
                  compact ? 'h-5 w-5 object-contain' : 'h-6 w-6 object-contain'
                }
              />
              <span
                className={`font-extrabold tracking-tight text-ink ${
                  compact ? 'text-[11px]' : 'text-xs'
                }`}
              >
                {enquiry.reviewLabel}
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
                  Service
                </span>
                <br />
                <strong>{service.name}</strong>
              </p>
              <p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                  Brief
                </span>
                <br />
                {enquiry.fields.map((field) => (
                  <span key={field.id} className="block">
                    <span className="text-neutral-muted">{field.label}: </span>
                    <strong>{brief[field.id]}</strong>
                  </span>
                ))}
              </p>
              <p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                  Contact
                </span>
                <br />
                <strong>{contact.name.trim()}</strong>
                <br />
                {contact.email.trim()}
                <br />
                {contact.phone.trim()}
              </p>
              {!compact ? (
                <p className="rounded-xl bg-surface/80 px-3 py-2 text-xs text-neutral-muted">
                  {enquiry.footerNote}
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
            if (step === 'review') void confirmEnquiry()
            else nextStep()
          }}
          size="sm"
          className={compact ? undefined : 'mt-4'}
        >
          {step === 'review'
            ? submitting
              ? 'Sending…'
              : 'Confirm enquiry'
            : 'Continue'}
        </ArrowPillButton>
      </div>
    </div>
  )
}

/**
 * Desktop sticky card + mobile bottom CTA — mirrors ViewingStickyCard:
 * fixed bar + centered compact enquiry modal.
 */
export function ServiceEnquiryCard({
  service,
  variant = 'sidebar',
}: {
  service: ServiceDetail
  variant?: 'sidebar' | 'mobile'
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { enquiry } = service

  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  if (variant === 'sidebar') {
    return (
      <div className="rounded-2xl border border-neutral-light bg-surface p-5 shadow-[0_8px_30px_rgba(42,46,50,0.08)] sm:p-6">
        <div>
          <p className="text-xl font-extrabold text-ink sm:text-2xl">
            {enquiry.cardTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-muted">
            {enquiry.cardSubtitle}
          </p>
        </div>
        <div className="mt-5">
          <ServiceEnquiryForm service={service} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-neutral-muted">
          {enquiry.footerNote}
        </p>
      </div>
    )
  }

  return (
    <>
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
            aria-label={enquiry.cardTitle}
            className="relative z-[91] flex min-h-[min(520px,78vh)] w-full max-w-[360px] flex-col overflow-visible rounded-2xl bg-surface px-5 py-5 shadow-[0_16px_48px_rgba(42,46,50,0.22)]"
          >
            <div className="relative mb-3 flex items-center justify-center">
              <p className="text-center text-[15px] font-extrabold text-ink">
                {enquiry.cardTitle}
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
              <ServiceEnquiryForm
                service={service}
                defaultOpen
                compact
                onSubmitted={() => setMobileOpen(false)}
                onActiveChange={(active) => {
                  if (!active) setMobileOpen(false)
                }}
              />
            </div>
            <p className="mt-3 text-center text-[10px] leading-snug text-neutral-muted">
              {enquiry.footerNote}
            </p>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-neutral-light bg-surface px-4 py-3 shadow-[0_-4px_20px_rgba(42,46,50,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-ink">
              {enquiry.cardTitle}
            </p>
          </div>
          <ArrowPillButton
            onClick={() => setMobileOpen(true)}
            size="sm"
            className="shrink-0"
          >
            Enquire
          </ArrowPillButton>
        </div>
      </div>
    </>
  )
}
