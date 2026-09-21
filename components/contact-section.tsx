'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, MapPin, Phone, X } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import type { CompanyContent, ContactContent } from '@/lib/site-content/types'
import { phoneHref } from '@/lib/site-content/phone'
import { useFormsCopy } from '@/components/site-catalog-provider'
import { submitContactEnquiryClient } from '@/lib/contact-enquiries'

type Step = 'idle' | 'interest' | 'details' | 'review'

type ContactForm = {
  purpose: string
  location: string
  message: string
  name: string
  email: string
  phone: string
}

const EMPTY: ContactForm = {
  purpose: '',
  location: '',
  message: '',
  name: '',
  email: '',
  phone: '',
}

const STEPS: Step[] = ['interest', 'details', 'review']

const fieldClass =
  'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary sm:rounded-xl sm:px-4 sm:py-3.5 sm:text-[15px]'

/**
 * Multi-step contact enquiry — same concept as Book a viewing:
 * idle CTA → interest → details → review.
 */
function ContactEnquiryForm() {
  const router = useRouter()
  const { contact: copy } = useFormsCopy()
  const stepTitle: Record<Exclude<Step, 'idle'>, string> = {
    interest: copy.steps.step1,
    details: copy.steps.step2,
    review: copy.steps.step3,
  }
  const [step, setStep] = useState<Step>('idle')
  const [form, setForm] = useState<ContactForm>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const stepIndex = STEPS.indexOf(step as Exclude<Step, 'idle'>)

  function go(next: Step) {
    setError(null)
    setStep(next)
  }

  function cancelFlow() {
    setError(null)
    setStep('idle')
    setForm(EMPTY)
  }

  function validateCurrent(): boolean {
    if (step === 'interest') {
      if (!form.purpose) {
        setError(copy.errors.purpose)
        return false
      }
      if (form.location.trim().length < 2) {
        setError(copy.errors.area)
        return false
      }
      if (form.message.trim().length < 8) {
        setError(copy.errors.message)
        return false
      }
    }
    if (step === 'details') {
      if (form.name.trim().length < 2) {
        setError(copy.errors.name)
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError(copy.errors.email)
        return false
      }
      if (!/^[+]?[\d\s()-]{7,}$/.test(form.phone.trim())) {
        setError(copy.errors.phone)
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

  async function confirmSend() {
    if (!validateCurrent()) return
    setSubmitting(true)
    try {
      const result = await submitContactEnquiryClient({
        purpose: form.purpose,
        location: form.location,
        message: form.message,
        name: form.name,
        email: form.email,
        phone: form.phone,
      })
      if (!result.ok) {
        setError(result.error || 'Could not send. Please try again.')
        return
      }
      showToast(copy.toastSuccess)
      setDone(true)
      setStep('idle')
      setForm(EMPTY)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'idle') {
    return (
      <div className="flex flex-col justify-center p-3.5 sm:p-7">
        {!done ? (
          <>
            <p className="text-base font-extrabold text-ink sm:text-xl">
              {copy.idleTitle}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-neutral-muted sm:mt-2 sm:text-sm sm:leading-relaxed">
              {copy.idleBody}
            </p>
            <div className="mt-3 sm:mt-6">
              <ArrowPillButton onClick={() => go('interest')} size="sm">
                {copy.idleCta}
              </ArrowPillButton>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-pill-soft via-pill-soft-mid to-surface px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-ink">
                  {copy.successTitle}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-muted">
                  {copy.successBody}
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setDone(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-muted hover:bg-surface hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3">
              <ArrowPillButton
                onClick={() => {
                  setDone(false)
                  go('interest')
                }}
                size="sm"
                variant="dark"
              >
                {copy.successAgain}
              </ArrowPillButton>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden p-3.5 sm:p-7">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
        <button
          type="button"
          onClick={prevStep}
          aria-label="Back"
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-muted transition-colors hover:bg-surface-alt hover:text-ink sm:h-8 sm:w-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
        <div className="flex flex-1 items-center gap-1 sm:gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-300 sm:h-1 ${
                i <= stepIndex ? 'bg-primary' : 'bg-neutral-light'
              }`}
            />
          ))}
        </div>
        <span className="w-7 text-right text-[10px] font-semibold text-neutral-muted sm:w-8 sm:text-[11px]">
          {stepIndex + 1}/{STEPS.length}
        </span>
      </div>

      <p className="mb-2 text-[13px] font-extrabold text-ink sm:mb-3 sm:text-sm">
        {stepTitle[step]}
      </p>

      <div key={step} className="animate-card-in" style={{ animationDelay: '0s' }}>
        {step === 'interest' ? (
          <div className="space-y-2.5 sm:space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted sm:mb-1.5 sm:text-xs">
                {copy.labelPurpose}
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-2 sm:gap-2">
                {copy.purposes.map((purpose) => (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() => {
                      if (purpose === copy.listPropertyPurpose) {
                        router.push('/list-with-us/')
                        return
                      }
                      setForm((f) => ({ ...f, purpose }))
                    }}
                    className={`rounded-lg border px-1.5 py-1.5 text-left text-[11px] font-semibold leading-tight transition-colors sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm ${
                      form.purpose === purpose
                        ? 'border-primary bg-primary text-white'
                        : 'border-neutral-light bg-surface-alt text-neutral-muted hover:border-primary hover:text-ink'
                    }`}
                  >
                    {purpose}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-preferred-area"
                className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted sm:mb-1.5 sm:text-xs"
              >
                {copy.labelArea}
              </label>
              <input
                id="contact-preferred-area"
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder={copy.placeholderArea}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted sm:mb-1.5 sm:text-xs">
                {copy.labelMessage}
              </label>
              <textarea
                rows={2}
                placeholder={copy.placeholderMessage}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className={`${fieldClass} resize-none`}
              />
            </div>
          </div>
        ) : null}

        {step === 'details' ? (
          <div className="space-y-2 sm:space-y-3">
            <input
              type="text"
              autoComplete="name"
              autoFocus
              placeholder={copy.placeholderName}
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className={fieldClass}
            />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={copy.placeholderEmail}
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className={fieldClass}
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={copy.placeholderPhone}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  nextStep()
                }
              }}
              className={fieldClass}
            />
            <p className="text-[10px] text-neutral-muted sm:text-[11px]">
              We’ll reach you by email or phone — no WhatsApp required.
            </p>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-pill-soft via-pill-soft-mid to-surface sm:rounded-2xl">
            <div className="flex items-center gap-2 border-b border-primary/10 px-3 py-1.5 sm:px-4 sm:py-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mojesu-logo-final.png"
                alt=""
                className="h-5 w-5 object-contain sm:h-6 sm:w-6"
              />
              <span className="text-[11px] font-extrabold tracking-tight text-ink sm:text-xs">
                Contact enquiry
              </span>
            </div>
            <div className="space-y-2 px-3 py-2.5 text-[13px] leading-snug text-ink sm:space-y-3 sm:px-4 sm:py-3.5 sm:text-sm sm:leading-relaxed">
              <p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted sm:text-[11px]">
                  Request
                </span>
                <br />
                <strong>{form.purpose}</strong>
                <br />
                {form.location}
              </p>
              <p className="line-clamp-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted sm:text-[11px]">
                  Message
                </span>
                <br />
                {form.message.trim()}
              </p>
              <p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted sm:text-[11px]">
                  Contact
                </span>
                <br />
                <strong>{form.name.trim()}</strong>
                <br />
                {form.email.trim()}
                <br />
                {form.phone.trim()}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-secondary sm:mt-2 sm:text-xs" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-2.5 sm:mt-4">
        <ArrowPillButton
          disabled={submitting}
          onClick={() => {
            if (step === 'review') void confirmSend()
            else nextStep()
          }}
          size="sm"
        >
          {step === 'review'
            ? submitting
              ? copy.sendingLabel
              : copy.confirmLabel
            : copy.continueLabel}
        </ArrowPillButton>
      </div>
    </div>
  )
}

export function ContactSection({
  company,
  contact,
}: {
  company: CompanyContent
  contact: ContactContent
}) {
  return (
    <section
      id="contact"
      className="flex flex-col gap-3 pt-4 pb-10 sm:gap-[60px] sm:py-20"
      aria-labelledby="contact-heading"
    >
      <div className="site-container flex flex-col items-center text-center">
        <div className="mb-2 flex w-full max-w-sm items-center gap-3 sm:mb-3">
          <span
            className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/50"
            aria-hidden="true"
          />
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {contact.eyebrow}
          </p>
          <span
            className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/50"
            aria-hidden="true"
          />
        </div>

        <h2
          id="contact-heading"
          className="max-w-2xl text-balance text-xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
        >
          {contact.titleBefore}{' '}
          <span className="text-primary-dark">{contact.titleAccent}</span>?
        </h2>
        <p className="mt-1.5 max-w-xl text-pretty text-[13px] leading-snug text-neutral-muted sm:mt-3 sm:text-[15px] sm:leading-relaxed">
          {contact.body}
        </p>
      </div>

      <div className="site-container">
        <div className="relative mx-auto w-full max-w-[1500px] overflow-hidden rounded-[10px]">
          <div className="absolute inset-0">
            <Image
              src={contact.backgroundImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              quality={70}
              loading="lazy"
              className="object-cover object-[31%_25%]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-accent-deep/55 via-accent-deep/15 to-transparent md:via-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 flex flex-col gap-3 px-3 pb-3 pt-[88px] sm:gap-6 sm:px-6 sm:pb-6 sm:pt-[220px] lg:flex-row lg:items-end lg:gap-10 lg:px-8 lg:pb-8 lg:pt-20 xl:gap-16">
            <div className="flex w-full flex-col overflow-hidden rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.08)] md:max-w-md lg:w-[35%] lg:max-w-none">
              <div className="bg-black/50 p-4 text-white backdrop-blur-md sm:p-5">
                <h3 className="text-base font-bold leading-snug sm:text-xl">
                  {contact.cardTitle}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/90 sm:mt-2.5 sm:text-[14px]">
                  {contact.cardBody}
                </p>
              </div>

              <div className="flex flex-col gap-2 bg-surface p-3 sm:gap-2.5 sm:p-5">
                <a
                  href={phoneHref(company.phoneTel)}
                  className="group flex items-center gap-3 rounded-[5px] bg-surface px-1 py-1 transition-colors hover:bg-surface-alt"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface shadow-[0_1px_13px_rgba(0,0,0,0.1)] sm:h-[47px] sm:w-[47px]">
                    <Phone className="h-4 w-4 text-ink" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-[12px] text-neutral-muted sm:text-[13px]">
                      Call us at:
                    </span>
                    <span className="block text-[13px] font-semibold text-ink sm:text-[14px]">
                      {company.phoneDisplay}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-ink/40 transition-colors group-hover:text-ink"
                    strokeWidth={1.75}
                  />
                </a>

                <a
                  href={company.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-[5px] bg-surface px-1 py-1 transition-colors hover:bg-surface-alt"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface shadow-[0_1px_13px_rgba(0,0,0,0.1)] sm:h-[47px] sm:w-[47px]">
                    <MapPin className="h-4 w-4 text-ink" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-[12px] text-neutral-muted sm:text-[13px]">
                      Visit us at:
                    </span>
                    <span className="block text-[13px] font-semibold leading-snug text-ink sm:text-[14px]">
                      {company.address}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-ink/40 transition-colors group-hover:text-ink"
                    strokeWidth={1.75}
                  />
                </a>
              </div>
            </div>

            <div className="w-full flex-1 overflow-hidden rounded-[10px] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.08)]">
              <ContactEnquiryForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
