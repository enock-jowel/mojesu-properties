'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  Clock3,
  Home,
  ImagePlus,
  KeyRound,
  LandPlot,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { AreaAutocomplete } from '@/components/area-autocomplete'
import { ArrowPillButton, ArrowPillLink } from '@/components/arrow-pill-button'
import { SiteLogo } from '@/components/site-logo'
import { showToast } from '@/lib/toast'
import { LIST_WITH_US } from '@/lib/list-with-us'
import { submitPropertySubmissionClient } from '@/lib/property-submissions/client-submit'
import {
  type BestTimeToReach,
  type ListingMode,
  type PropertyCategory,
  type PropertySubmissionRequest,
} from '@/lib/property-submissions'
import {
  useFormsCopy,
  useTaxonomy,
} from '@/components/site-catalog-provider'

type Step = 'idle' | 'property' | 'details' | 'review'

type PhotoDraft = { id: string; src: string; name: string }

type FormState = {
  listingMode: ListingMode | null
  category: PropertyCategory | null
  location: string
  roughAddress: string
  bedrooms: string
  bathrooms: string
  approxPlotSize: string
  approxFloorArea: string
  askingPrice: string
  priceNotSure: boolean
  contactName: string
  contactPhone: string
  bestTimeToReach: BestTimeToReach
}

const EMPTY: FormState = {
  listingMode: null,
  category: null,
  location: '',
  roughAddress: '',
  bedrooms: '',
  bathrooms: '',
  approxPlotSize: '',
  approxFloorArea: '',
  askingPrice: '',
  priceNotSure: false,
  contactName: '',
  contactPhone: '',
  bestTimeToReach: 'Anytime',
}

const STEPS: Step[] = ['property', 'details', 'review']

const IDLE_BULLET_ICONS = [Clock3, Camera, ShieldCheck] as const

const MAX_PHOTOS = 8
const MAX_PHOTO_BYTES = 1_200_000

const FIELD_CLASS =
  'w-full rounded-xl border border-neutral-light bg-surface-alt px-4 py-3.5 text-[15px] text-ink outline-none transition-colors focus:border-primary'

const FIELD_CLASS_COMPACT =
  'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'

const LABEL_CLASS =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-muted'

const LABEL_CLASS_COMPACT =
  'mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function formatPriceLabel(form: FormState): string {
  if (form.priceNotSure || !form.askingPrice.trim()) return 'Not sure yet'
  const n = Number(form.askingPrice.replace(/,/g, ''))
  if (!Number.isFinite(n)) return form.askingPrice
  return `UGX ${n.toLocaleString('en-US')}`
}

function detailsLine(form: FormState): string {
  if (form.category === 'house') {
    const beds = form.bedrooms.trim() || '—'
    const baths = form.bathrooms.trim() || '—'
    return `${beds} bed · ${baths} bath`
  }
  if (form.category === 'land') {
    return form.approxPlotSize.trim() || 'Plot size not specified'
  }
  if (form.category === 'commercial') {
    return form.approxFloorArea.trim() || 'Floor area not specified'
  }
  return '—'
}

function SubmissionConfirmation({
  contactName,
  whatsappUrl,
  emailSent,
  onClose,
}: {
  contactName: string
  whatsappUrl: string | null
  emailSent: boolean
  onClose: () => void
}) {
  const { listWithUs: copy } = useFormsCopy()

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-accent-deep/55 p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-confirm-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-xl"
      >
        <div className="bg-gradient-to-br from-pill-soft via-pill-soft-mid to-pill-soft-cool px-6 pb-5 pt-6 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-light/80 bg-surface/90 text-ink transition-colors hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>

          <SiteLogo
            markClassName="h-9 w-9"
            wordmarkClassName="text-xl font-extrabold tracking-tight text-ink"
          />

          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h2
                id="submission-confirm-title"
                className="text-xl font-extrabold text-ink sm:text-2xl"
              >
                {copy.confirmTitle}
              </h2>
              <p className="text-sm text-neutral-muted">
                {copy.confirmSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:pb-8">
          <p className="text-[15px] leading-relaxed text-neutral-muted">
            Thanks{contactName ? `, ${contactName}` : ''}! {copy.confirmBody}
          </p>

          <p className="mt-4 rounded-2xl border border-primary/20 bg-pill-soft px-4 py-3 text-sm text-ink">
            {copy.confirmNote}
          </p>

          {emailSent ? (
            <p className="mt-3 text-sm text-neutral-muted">
              Manager notified by email.
            </p>
          ) : null}

          {whatsappUrl ? (
            <ArrowPillLink
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="mt-6"
            >
              {copy.whatsappCta}
            </ArrowPillLink>
          ) : (
            <p className="mt-6 text-sm text-neutral-muted">
              WhatsApp is not configured. Set{' '}
              <code className="text-ink">NEXT_PUBLIC_WHATSAPP_NUMBER</code> in
              `.env.local`.
            </p>
          )}

          <p className="mt-3 text-center text-xs text-neutral-muted">
            Opens WhatsApp with your submission details ready — review and tap
            Send.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-full border border-neutral-light px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
          >
            {copy.doneLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Multi-step List With Us form — same concept as Book a viewing:
 * idle CTA → property → contact details → review → confirmation modal.
 */
export function ListWithUsForm({
  defaultOpen = false,
  compact = false,
  onSubmitted,
  onActiveChange,
  ctaLabel = LIST_WITH_US.ctaLabel,
}: {
  defaultOpen?: boolean
  /** Denser controls for the centered mobile modal */
  compact?: boolean
  onSubmitted?: () => void
  onActiveChange?: (active: boolean) => void
  /** Marketing CTA — from list_with_us CMS page content when available */
  ctaLabel?: string
} = {}) {
  const { listWithUs: copy } = useFormsCopy()
  const { intakeCategory, intakeMode } = useTaxonomy()
  const stepTitle: Record<Exclude<Step, 'idle'>, string> = {
    property: copy.steps.step1,
    details: copy.steps.step2,
    review: copy.steps.step3,
  }

  const [step, setStep] = useState<Step>(defaultOpen ? 'property' : 'idle')
  const [form, setForm] = useState<FormState>(EMPTY)
  const [photos, setPhotos] = useState<PhotoDraft[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    contactName: string
    whatsappUrl: string | null
    emailSent: boolean
  } | null>(null)

  const stepIndex = STEPS.indexOf(step as Exclude<Step, 'idle'>)
  const fieldClass = compact ? FIELD_CLASS_COMPACT : FIELD_CLASS
  const labelClass = compact ? LABEL_CLASS_COMPACT : LABEL_CLASS
  const pillClass = (active: boolean) =>
    compact
      ? `rounded-lg border px-2 py-1.5 text-[11px] font-semibold leading-tight transition-colors ${
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
    setForm(EMPTY)
    setPhotos([])
    onActiveChange?.(false)
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      showToast(`You can attach up to ${MAX_PHOTOS} photos`)
      return
    }

    const next: PhotoDraft[] = []
    for (const file of Array.from(files).slice(0, room)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_PHOTO_BYTES) {
        showToast(`${file.name} is too large — keep under ~1MB`)
        continue
      }
      try {
        const src = await readFileAsDataUrl(file)
        next.push({ id: crypto.randomUUID(), src, name: file.name })
      } catch {
        /* skip unreadable */
      }
    }
    if (next.length) setPhotos((prev) => [...prev, ...next])
  }

  function validateCurrent(): boolean {
    if (step === 'property') {
      if (!form.listingMode) {
        setError(copy.errors.mode)
        return false
      }
      if (!form.category) {
        setError(copy.errors.category)
        return false
      }
      if (!form.location.trim()) {
        setError(copy.errors.area)
        return false
      }
      if (form.roughAddress.trim().length < 3) {
        setError(copy.errors.address)
        return false
      }
      if (!form.priceNotSure && form.askingPrice.trim()) {
        const n = Number(form.askingPrice.replace(/,/g, ''))
        if (!Number.isFinite(n) || n < 0) {
          setError(copy.errors.price)
          return false
        }
      }
    }
    if (step === 'details') {
      if (form.contactName.trim().length < 2) {
        setError(copy.errors.name)
        return false
      }
      if (!/^[+]?[\d\s()-]{7,}$/.test(form.contactPhone.trim())) {
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

  async function confirmSubmit() {
    if (!validateCurrent()) return
    if (!form.listingMode || !form.category) return

    const priceNum = form.priceNotSure
      ? null
      : form.askingPrice.trim()
        ? Number(form.askingPrice.replace(/,/g, ''))
        : null

    const payload: PropertySubmissionRequest = {
      listingMode: form.listingMode,
      category: form.category,
      location: form.location.trim(),
      roughAddress: form.roughAddress.trim(),
      bedrooms:
        form.category === 'house' && form.bedrooms.trim()
          ? Number(form.bedrooms)
          : null,
      bathrooms:
        form.category === 'house' && form.bathrooms.trim()
          ? Number(form.bathrooms)
          : null,
      approxPlotSize:
        form.category === 'land' ? form.approxPlotSize.trim() || null : null,
      approxFloorArea:
        form.category === 'commercial'
          ? form.approxFloorArea.trim() || null
          : null,
      photos: photos.map((p) => p.src),
      askingPrice: priceNum,
      priceNotSure: form.priceNotSure || priceNum == null,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      bestTimeToReach: form.bestTimeToReach,
    }

    setSubmitting(true)
    try {
      const result = await submitPropertySubmissionClient(payload)
      if (!result.ok) {
        showToast(
          result.error ||
            'Could not save your submission. Please try again or WhatsApp us.',
        )
        return
      }
      setConfirmation({
        contactName: payload.contactName,
        whatsappUrl: result.whatsappUrl ?? null,
        emailSent: Boolean(result.emailSent),
      })
      setStep('idle')
      setForm(EMPTY)
      setPhotos([])
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
          compact ? (
            <ArrowPillButton onClick={() => go('property')} size="sm">
              {ctaLabel}
            </ArrowPillButton>
          ) : (
            <div className="flex flex-col gap-4">
              <ul className="space-y-2.5">
                {copy.idleBullets.map((text, i) => {
                  const Icon = IDLE_BULLET_ICONS[i] ?? Clock3
                  return (
                    <li
                      key={text}
                      className="flex items-center gap-2.5 text-sm text-ink"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </span>
                      <span className="font-medium leading-snug">{text}</span>
                    </li>
                  )
                })}
              </ul>
              <ArrowPillButton
                onClick={() => go('property')}
                size="lg"
                attention
              >
                {ctaLabel}
              </ArrowPillButton>
            </div>
          )
        ) : null}
        {confirmation ? (
          <SubmissionConfirmation
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

        <p className="mb-3 text-sm font-extrabold text-ink">
          {stepTitle[step]}
        </p>

        <div
          key={step}
          className={`${compact ? 'flex flex-1 flex-col' : 'min-h-[140px]'} ${
            step === 'property' ? '' : 'animate-card-in'
          }`}
          style={step === 'property' ? undefined : { animationDelay: '0s' }}
        >
          {step === 'property' ? (
            <div
              className={
                compact
                  ? 'mx-auto flex w-full max-w-[280px] flex-1 flex-col space-y-2.5 text-left'
                  : 'space-y-4'
              }
            >
              <div>
                <p className={labelClass}>{copy.labels.listingType}</p>
                <div className={`grid grid-cols-2 ${compact ? 'gap-1.5' : 'gap-2'}`}>
                  {(
                    [
                      {
                        id: 'rent' as const,
                        label: intakeMode.rent || 'Rent',
                        Icon: KeyRound,
                      },
                      {
                        id: 'sale' as const,
                        label: intakeMode.sale || 'Sell',
                        Icon: Tag,
                      },
                    ] as const
                  ).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, listingMode: id }))
                      }
                      className={
                        compact
                          ? `flex items-center justify-center gap-1.5 text-center transition-colors ${pillClass(
                              form.listingMode === id,
                            )}`
                          : `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                              form.listingMode === id
                                ? 'border-primary bg-primary text-white'
                                : 'border-neutral-light bg-surface-alt text-neutral-muted hover:border-primary hover:text-ink'
                            }`
                      }
                    >
                      <Icon
                        className={
                          compact ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'
                        }
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className={labelClass}>{copy.labels.propertyType}</p>
                <div
                  role="tablist"
                  aria-label={copy.labels.propertyType}
                  className={
                    compact
                      ? 'mx-auto grid max-w-[280px] grid-cols-3 gap-1.5'
                      : 'allow-x-scroll flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-alt p-1'
                  }
                >
                  {(
                    [
                      {
                        id: 'house' as const,
                        label: intakeCategory.house || 'House/Apt',
                        Icon: Home,
                      },
                      {
                        id: 'land' as const,
                        label: intakeCategory.land || 'Land',
                        Icon: LandPlot,
                      },
                      {
                        id: 'commercial' as const,
                        label: intakeCategory.commercial || 'Commercial',
                        Icon: Building2,
                      },
                    ] as const
                  ).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={form.category === id}
                      onClick={() =>
                        setForm((f) => ({ ...f, category: id }))
                      }
                      className={
                        compact
                          ? `inline-flex items-center justify-center gap-1 ${pillClass(
                              form.category === id,
                            )}`
                          : `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                              form.category === id
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-neutral-muted hover:text-ink'
                            }`
                      }
                    >
                      <Icon
                        className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5'}
                        aria-hidden="true"
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="list-area" className={labelClass}>
                  {copy.labels.area}
                </label>
                <AreaAutocomplete
                  id="list-area"
                  value={form.location}
                  compact={compact}
                  onChange={(name) =>
                    setForm((f) => ({ ...f, location: name }))
                  }
                />
              </div>

              <div>
                <label htmlFor="rough-address" className={labelClass}>
                  {copy.labels.address}
                </label>
                <input
                  id="rough-address"
                  type="text"
                  value={form.roughAddress}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      roughAddress: e.target.value,
                    }))
                  }
                  placeholder={copy.placeholders.address}
                  className={`${fieldClass}${compact ? ' text-center' : ''}`}
                />
                <p
                  className={`text-neutral-muted ${
                    compact
                      ? 'mt-1.5 text-center text-[10px]'
                      : 'mt-1.5 text-[11px]'
                  }`}
                >
                  For arranging the visit only — not shown publicly.
                </p>
              </div>

              {form.category === 'house' ? (
                <div className={`grid grid-cols-2 ${compact ? 'gap-1.5' : 'gap-2'}`}>
                  <div>
                    <label htmlFor="bedrooms" className={labelClass}>
                      {copy.labels.bedrooms}
                    </label>
                    <input
                      id="bedrooms"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={form.bedrooms}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          bedrooms: e.target.value,
                        }))
                      }
                      placeholder={copy.placeholders.bedrooms}
                      className={`${fieldClass}${compact ? ' text-center' : ''}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="bathrooms" className={labelClass}>
                      {copy.labels.bathrooms}
                    </label>
                    <input
                      id="bathrooms"
                      type="number"
                      min={0}
                      step={0.5}
                      inputMode="decimal"
                      value={form.bathrooms}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          bathrooms: e.target.value,
                        }))
                      }
                      placeholder={copy.placeholders.bathrooms}
                      className={`${fieldClass}${compact ? ' text-center' : ''}`}
                    />
                  </div>
                </div>
              ) : null}

              {form.category === 'land' ? (
                <div>
                  <label htmlFor="plot-size" className={labelClass}>
                    {copy.labels.plotSize}
                  </label>
                  <input
                    id="plot-size"
                    type="text"
                    value={form.approxPlotSize}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        approxPlotSize: e.target.value,
                      }))
                    }
                    placeholder={copy.placeholders.plotSize}
                    className={`${fieldClass}${compact ? ' text-center' : ''}`}
                  />
                </div>
              ) : null}

              {form.category === 'commercial' ? (
                <div>
                  <label htmlFor="floor-area" className={labelClass}>
                    {copy.labels.floorArea}
                  </label>
                  <input
                    id="floor-area"
                    type="text"
                    value={form.approxFloorArea}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        approxFloorArea: e.target.value,
                      }))
                    }
                    placeholder={copy.placeholders.floorArea}
                    className={`${fieldClass}${compact ? ' text-center' : ''}`}
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="asking-price" className={labelClass}>
                  {copy.labels.askingPrice}
                </label>
                <input
                  id="asking-price"
                  type="text"
                  inputMode="numeric"
                  disabled={form.priceNotSure}
                  value={form.askingPrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      askingPrice: e.target.value,
                    }))
                  }
                  placeholder={copy.placeholders.askingPrice}
                  className={`${fieldClass} disabled:opacity-50${compact ? ' text-center' : ''}`}
                />
                <label
                  className={`mt-2.5 flex cursor-pointer items-center gap-2.5 text-ink ${
                    compact ? 'justify-center text-xs' : 'text-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.priceNotSure}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceNotSure: e.target.checked,
                        askingPrice: e.target.checked ? '' : f.askingPrice,
                      }))
                    }
                    className="h-4 w-4 rounded border-neutral-light accent-[var(--color-primary,#63aaf0)]"
                  />
                  Not sure yet
                </label>
              </div>

              <div className={compact ? 'mt-auto' : undefined}>
                <p className={labelClass}>{copy.labels.photos}</p>
                <p
                  className={`text-neutral-muted ${
                    compact
                      ? 'text-center text-[10px]'
                      : 'text-[11px]'
                  }`}
                >
                  Not required — we take professional photos on the visit.
                </p>
                <div
                  className={`mt-2 grid grid-cols-4 ${compact ? 'gap-1.5' : 'gap-2'}`}
                >
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`group relative aspect-square overflow-hidden bg-surface-alt ${
                        compact ? 'rounded-lg' : 'rounded-xl'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.src}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((prev) =>
                            prev.filter((p) => p.id !== photo.id),
                          )
                        }
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-deep/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS ? (
                    <label
                      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 border border-dashed border-neutral-light bg-surface-alt text-neutral-muted transition-colors hover:border-primary hover:text-ink ${
                        compact ? 'rounded-lg' : 'rounded-xl'
                      }`}
                    >
                      <ImagePlus className="h-4 w-4" />
                      <span className="text-[10px] font-semibold">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          void onFiles(e.target.files)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  ) : null}
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
                value={form.contactName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    contactName: e.target.value,
                  }))
                }
                className={`${fieldClass}${compact ? ' text-center' : ''}`}
              />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={copy.placeholders.phone}
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    contactPhone: e.target.value,
                  }))
                }
                className={`${fieldClass}${compact ? ' text-center' : ''}`}
              />
              <div className={compact ? 'mt-auto' : undefined}>
                <p className={labelClass}>{copy.labels.bestTime}</p>
                <div
                  className={`grid grid-cols-2 ${
                    compact ? 'mx-auto max-w-[280px] gap-1.5' : 'gap-2'
                  }`}
                >
                  {copy.bestTimes.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          bestTimeToReach: slot as BestTimeToReach,
                        }))
                      }
                      className={
                        compact
                          ? pillClass(form.bestTimeToReach === slot)
                          : `rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                              form.bestTimeToReach === slot
                                ? 'border-primary bg-primary text-white'
                                : 'border-neutral-light bg-surface-alt text-neutral-muted hover:border-primary hover:text-ink'
                            }`
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
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
                  Property visit request
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
                    Property
                  </span>
                  <br />
                  <strong>
                    {form.category
                      ? intakeCategory[form.category] || form.category
                      : '—'}{' '}
                    ·{' '}
                    {form.listingMode
                      ? intakeMode[form.listingMode] || form.listingMode
                      : '—'}
                  </strong>
                  <br />
                  {form.location}
                  <br />
                  {form.roughAddress.trim()}
                  <br />
                  {detailsLine(form)}
                  <br />
                  {formatPriceLabel(form)}
                  {photos.length > 0 ? (
                    <>
                      <br />
                      {photos.length} photo
                      {photos.length === 1 ? '' : 's'} attached
                    </>
                  ) : null}
                </p>
                <p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                    Contact
                  </span>
                  <br />
                  <strong>{form.contactName.trim()}</strong>
                  <br />
                  {form.contactPhone.trim()}
                  <br />
                  Best time: {form.bestTimeToReach}
                </p>
                {!compact ? (
                  <p className="rounded-xl bg-surface/80 px-3 py-2 text-xs text-neutral-muted">
                    {copy.confirmNote}
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
              if (step === 'review') void confirmSubmit()
              else nextStep()
            }}
            size={compact ? 'sm' : 'lg'}
            className={compact ? undefined : 'mt-4'}
          >
            {step === 'review'
              ? submitting
                ? 'Sending…'
                : ctaLabel
              : 'Continue'}
          </ArrowPillButton>
        </div>
      </div>

      {confirmation ? (
        <SubmissionConfirmation
          {...confirmation}
          onClose={() => {
            setConfirmation(null)
            onSubmitted?.()
          }}
        />
      ) : null}
    </>
  )
}

function VisitCardHeader({
  title,
  subtitle,
  compact = false,
}: {
  title: string
  subtitle: string
  compact?: boolean
}) {
  return (
    <div className="relative z-[1] px-5 pt-5 sm:px-6 sm:pt-6">
      <p
        className={`font-extrabold tracking-tight text-ink ${
          compact
            ? 'text-lg sm:text-xl'
            : 'text-2xl sm:text-[1.65rem] sm:leading-tight'
        }`}
      >
        {title}
      </p>
      <p
        className={`leading-relaxed text-neutral-muted ${
          compact ? 'mt-1 text-sm' : 'mt-2 text-[15px]'
        }`}
      >
        {subtitle}
      </p>
    </div>
  )
}

/**
 * Desktop sticky card (unchanged visit treatment) + mobile bottom bar /
 * centered compact modal matching Book a viewing exactly.
 */
export function ListWithUsEnquiryCard({
  variant = 'sidebar',
  ctaLabel,
  cardTitle,
  cardSubtitle,
  footerNote,
}: {
  variant?: 'sidebar' | 'mobile'
  ctaLabel?: string
  cardTitle?: string
  cardSubtitle?: string
  footerNote?: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [formActive, setFormActive] = useState(false)
  const content = {
    ...LIST_WITH_US,
    ...(ctaLabel ? { ctaLabel } : {}),
    ...(cardTitle ? { cardTitle } : {}),
    ...(cardSubtitle ? { cardSubtitle } : {}),
    ...(footerNote ? { footerNote } : {}),
  }

  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  if (variant === 'sidebar') {
    return (
      <div
        className={`animate-visit-card-in relative overflow-hidden rounded-[1.35rem] border border-visit-accent/30 shadow-[0_12px_40px_rgba(99,170,240,0.18)] ring-1 ring-visit-accent/15 ${
          formActive ? 'visit-card-flow-calm' : 'visit-card-flow'
        }`}
      >
        <VisitCardHeader
          title={content.cardTitle}
          subtitle={content.cardSubtitle}
          compact={formActive}
        />
        <div className="relative z-[1] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <ListWithUsForm
            ctaLabel={content.ctaLabel}
            onActiveChange={(active) => setFormActive(active)}
          />
          {!formActive ? (
            <p className="mt-4 border-t border-visit-accent/20 pt-3 text-xs leading-relaxed text-neutral-muted">
              {content.footerNote}
            </p>
          ) : null}
        </div>
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
            aria-label="Request a visit"
            className="relative z-[91] flex min-h-[min(520px,78vh)] w-full max-w-[360px] flex-col overflow-visible rounded-2xl bg-surface px-5 py-5 shadow-[0_16px_48px_rgba(42,46,50,0.22)]"
          >
            <div className="relative mb-3 flex items-center justify-center">
              <p className="text-center text-[15px] font-extrabold text-ink">
                Request a visit
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
              <ListWithUsForm
                defaultOpen
                compact
                ctaLabel={content.ctaLabel}
                onSubmitted={() => setMobileOpen(false)}
                onActiveChange={(active) => {
                  if (!active) setMobileOpen(false)
                }}
              />
            </div>
            <p className="mt-3 text-center text-[10px] leading-snug text-neutral-muted">
              {content.footerNote}
            </p>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-neutral-light bg-surface px-4 py-3 shadow-[0_-4px_20px_rgba(42,46,50,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-ink">
              {content.cardTitle}
            </p>
          </div>
          <ArrowPillButton
            onClick={() => setMobileOpen(true)}
            size="sm"
            className="shrink-0"
          >
            {content.ctaLabel}
          </ArrowPillButton>
        </div>
      </div>
    </>
  )
}
