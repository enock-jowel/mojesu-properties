'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import {
  ContentStepHeader,
  fieldClass,
  Label,
} from '@/components/admin/content-chrome'
import { deleteService, saveService } from '@/lib/content/actions'
import { isServiceId } from '@/lib/content/map'
import type {
  ContentStatus,
  ServiceRow,
  ServiceWriteInput,
} from '@/lib/content/types'
import type {
  ServiceEnquiryConfig,
  ServiceId,
  ServiceOfferingItem,
  ServiceProcessStep,
} from '@/lib/services'

type Step =
  | 'basics'
  | 'whatWeDo'
  | 'offerings'
  | 'process'
  | 'enquiry'
  | 'review'

const STEPS: Step[] = [
  'basics',
  'whatWeDo',
  'offerings',
  'process',
  'enquiry',
  'review',
]

const STEP_TITLE: Record<Step, string> = {
  basics: 'Basics',
  whatWeDo: 'What we do',
  offerings: 'Offerings',
  process: 'Process',
  enquiry: 'Enquiry',
  review: 'Review',
}

const SERVICE_IDS: ServiceId[] = [
  'property-management',
  'valuation',
  'surveying',
  'agent-search',
  'development',
  'facilities',
]

const SERVICE_KEY_LABEL: Record<ServiceId, string> = {
  'property-management': 'Property Management',
  valuation: 'Valuation & Consultancy',
  surveying: 'Land Surveying',
  'agent-search': 'Agent-Assisted Search',
  development: 'Development Consulting',
  facilities: 'Facilities Management',
}

const DEFAULT_ENQUIRY: ServiceEnquiryConfig = {
  ctaLabel: 'Enquire',
  cardTitle: 'Tell us what you need',
  cardSubtitle: "We'll follow up shortly.",
  briefStepTitle: 'Your brief',
  fields: [
    {
      id: 'need',
      label: 'What do you need?',
      type: 'text',
      required: true,
    },
  ],
  footerNote: 'No obligation.',
  reviewLabel: 'Review',
}

function emptyDraft(initial?: ServiceRow): ServiceWriteInput {
  if (initial) {
    return {
      service_key: initial.service_key,
      slug: initial.slug,
      name: initial.name,
      description: initial.description,
      hero_description: initial.hero_description,
      image: initial.image,
      image_alt: initial.image_alt,
      icon_class: initial.icon_class,
      enquiry: initial.enquiry,
      what_we_do: { ...initial.what_we_do },
      offerings: {
        ...initial.offerings,
        items: [...(initial.offerings?.items || [])],
      },
      process: {
        ...initial.process,
        steps: [...(initial.process?.steps || [])],
      },
      status: initial.status,
      sort_order: initial.sort_order,
    }
  }
  return {
    service_key: 'property-management',
    slug: '',
    name: '',
    description: '',
    hero_description: '',
    image: '',
    image_alt: '',
    icon_class: 'fi fi-sr-building',
    enquiry: DEFAULT_ENQUIRY,
    what_we_do: { title: '', body: '', image: '', imageAlt: '' },
    offerings: { title: '', body: '', items: [] },
    process: { title: '', body: '', image: '', imageAlt: '', steps: [] },
    status: 'draft',
    sort_order: 0,
  }
}

export function ServiceEditor({ initial }: { initial?: ServiceRow }) {
  const router = useRouter()
  const seed = useMemo(() => emptyDraft(initial), [initial])
  const [step, setStep] = useState<Step>('basics')
  const [form, setForm] = useState(seed)
  const [enquiryJson, setEnquiryJson] = useState(
    JSON.stringify(seed.enquiry, null, 2),
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const stepIndex = STEPS.indexOf(step)

  function patch<K extends keyof ServiceWriteInput>(
    key: K,
    value: ServiceWriteInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function parseEnquiry(): ServiceEnquiryConfig | string {
    try {
      const parsed = JSON.parse(enquiryJson) as ServiceEnquiryConfig
      if (!parsed || typeof parsed !== 'object') {
        return 'Enquiry JSON must be an object.'
      }
      if (!parsed.ctaLabel || !parsed.cardTitle || !Array.isArray(parsed.fields)) {
        return 'Enquiry JSON is missing required fields (ctaLabel, cardTitle, fields).'
      }
      return parsed
    } catch {
      return 'Invalid JSON — check syntax and try again.'
    }
  }

  function canContinue(): string | null {
    if (step === 'basics') {
      if (!form.name.trim()) return 'Name is required.'
      if (!form.slug.trim()) return 'Slug is required.'
      if (!isServiceId(form.service_key)) return 'Choose a valid service key.'
    }
    if (step === 'enquiry') {
      const parsed = parseEnquiry()
      if (typeof parsed === 'string') return parsed
    }
    return null
  }

  function goNext() {
    const block = canContinue()
    if (block) {
      setError(block)
      return
    }
    if (step === 'enquiry') {
      const parsed = parseEnquiry()
      if (typeof parsed !== 'string') {
        patch('enquiry', parsed)
      }
    }
    setError(null)
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next)
  }

  function goBack() {
    setError(null)
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev)
  }

  function buildPayload(status: ContentStatus): ServiceWriteInput | string {
    const enquiry = parseEnquiry()
    if (typeof enquiry === 'string') return enquiry
    return { ...form, enquiry, status }
  }

  function onSave(status: ContentStatus) {
    setError(null)
    const payload = buildPayload(status)
    if (typeof payload === 'string') {
      setError(payload)
      return
    }
    startTransition(async () => {
      const result = await saveService(payload, initial?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/services/')
      router.refresh()
    })
  }

  function onDelete() {
    if (!initial?.id) return
    if (!window.confirm('Delete this service permanently?')) return
    startTransition(async () => {
      const result = await deleteService(initial.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/services/')
      router.refresh()
    })
  }

  function updateOffering(index: number, item: ServiceOfferingItem) {
    setForm((prev) => {
      const items = [...prev.offerings.items]
      items[index] = item
      return { ...prev, offerings: { ...prev.offerings, items } }
    })
  }

  function updateStep(index: number, stepItem: ServiceProcessStep) {
    setForm((prev) => {
      const steps = [...prev.process.steps]
      steps[index] = stepItem
      return { ...prev, process: { ...prev.process, steps } }
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ContentStepHeader
        title={STEP_TITLE[step]}
        stepIndex={stepIndex}
        stepCount={STEPS.length}
        onBack={stepIndex > 0 ? goBack : undefined}
      />

      <div className="animate-card-in">
        {step === 'basics' ? (
          <div className="flex flex-col gap-4">
            <div>
              <Label>Service key</Label>
              <select
                className={fieldClass}
                value={form.service_key}
                onChange={(e) => {
                  const key = e.target.value
                  if (isServiceId(key)) patch('service_key', key)
                }}
              >
                {SERVICE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {SERVICE_KEY_LABEL[id]}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Slug" value={form.slug} onChange={(v) => patch('slug', v)} />
            <Field label="Name" value={form.name} onChange={(v) => patch('name', v)} />
            <TextArea
              label="Description"
              value={form.description}
              onChange={(v) => patch('description', v)}
            />
            <TextArea
              label="Hero description"
              value={form.hero_description}
              onChange={(v) => patch('hero_description', v)}
            />
            <Field label="Image URL" value={form.image} onChange={(v) => patch('image', v)} />
            <Field
              label="Image alt"
              value={form.image_alt}
              onChange={(v) => patch('image_alt', v)}
            />
            <Field
              label="Icon class"
              value={form.icon_class}
              onChange={(v) => patch('icon_class', v)}
              placeholder="fi fi-sr-building"
            />
            <div>
              <Label>Sort order</Label>
              <input
                type="number"
                className={fieldClass}
                value={form.sort_order}
                onChange={(e) => patch('sort_order', Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className={fieldClass}
                value={form.status}
                onChange={(e) =>
                  patch('status', e.target.value as ContentStatus)
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        ) : null}

        {step === 'whatWeDo' ? (
          <div className="flex flex-col gap-4">
            <Field
              label="Title"
              value={form.what_we_do.title}
              onChange={(v) =>
                patch('what_we_do', { ...form.what_we_do, title: v })
              }
            />
            <TextArea
              label="Body"
              value={form.what_we_do.body}
              onChange={(v) =>
                patch('what_we_do', { ...form.what_we_do, body: v })
              }
            />
            <Field
              label="Image URL"
              value={form.what_we_do.image}
              onChange={(v) =>
                patch('what_we_do', { ...form.what_we_do, image: v })
              }
            />
            <Field
              label="Image alt"
              value={form.what_we_do.imageAlt}
              onChange={(v) =>
                patch('what_we_do', { ...form.what_we_do, imageAlt: v })
              }
            />
          </div>
        ) : null}

        {step === 'offerings' ? (
          <div className="flex flex-col gap-4">
            <Field
              label="Section title"
              value={form.offerings.title}
              onChange={(v) =>
                patch('offerings', { ...form.offerings, title: v })
              }
            />
            <TextArea
              label="Section body"
              value={form.offerings.body}
              onChange={(v) =>
                patch('offerings', { ...form.offerings, body: v })
              }
            />
            <button
              type="button"
              onClick={() =>
                patch('offerings', {
                  ...form.offerings,
                  items: [
                    ...form.offerings.items,
                    { title: '', description: '', iconClass: 'fi fi-rr-star' },
                  ],
                })
              }
              className="self-start rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-neutral-muted hover:bg-pill-soft hover:text-ink"
            >
              + Add offering
            </button>
            <ul className="flex flex-col gap-3">
              {form.offerings.items.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4"
                >
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        patch('offerings', {
                          ...form.offerings,
                          items: form.offerings.items.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-[10px] font-bold text-secondary"
                    >
                      Remove
                    </button>
                  </div>
                  <Field
                    label="Title"
                    value={item.title}
                    onChange={(v) => updateOffering(i, { ...item, title: v })}
                  />
                  <TextArea
                    label="Description"
                    value={item.description}
                    onChange={(v) =>
                      updateOffering(i, { ...item, description: v })
                    }
                  />
                  <Field
                    label="Icon class"
                    value={item.iconClass}
                    onChange={(v) => updateOffering(i, { ...item, iconClass: v })}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 'process' ? (
          <div className="flex flex-col gap-4">
            <Field
              label="Section title"
              value={form.process.title}
              onChange={(v) => patch('process', { ...form.process, title: v })}
            />
            <TextArea
              label="Section body"
              value={form.process.body}
              onChange={(v) => patch('process', { ...form.process, body: v })}
            />
            <Field
              label="Image URL"
              value={form.process.image}
              onChange={(v) => patch('process', { ...form.process, image: v })}
            />
            <Field
              label="Image alt"
              value={form.process.imageAlt}
              onChange={(v) =>
                patch('process', { ...form.process, imageAlt: v })
              }
            />
            <button
              type="button"
              onClick={() =>
                patch('process', {
                  ...form.process,
                  steps: [...form.process.steps, { title: '', description: '' }],
                })
              }
              className="self-start rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-neutral-muted hover:bg-pill-soft hover:text-ink"
            >
              + Add step
            </button>
            <ul className="flex flex-col gap-3">
              {form.process.steps.map((stepItem, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4"
                >
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        patch('process', {
                          ...form.process,
                          steps: form.process.steps.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-[10px] font-bold text-secondary"
                    >
                      Remove
                    </button>
                  </div>
                  <Field
                    label="Step title"
                    value={stepItem.title}
                    onChange={(v) => updateStep(i, { ...stepItem, title: v })}
                  />
                  <TextArea
                    label="Step description"
                    value={stepItem.description}
                    onChange={(v) =>
                      updateStep(i, { ...stepItem, description: v })
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 'enquiry' ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-muted">
              Edit the enquiry card config as JSON. Required keys: ctaLabel,
              cardTitle, cardSubtitle, briefStepTitle, fields, footerNote,
              reviewLabel.
            </p>
            <textarea
              className={`${fieldClass} min-h-[320px] font-mono text-xs`}
              value={enquiryJson}
              onChange={(e) => setEnquiryJson(e.target.value)}
            />
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 text-sm">
            <p className="font-bold text-ink">{form.name || 'Untitled service'}</p>
            <p className="mt-1 text-neutral-muted">
              {SERVICE_KEY_LABEL[form.service_key]} · /{form.slug}/ ·{' '}
              {form.status}
            </p>
            <p className="mt-3 text-neutral-muted">{form.description}</p>
            <p className="mt-2 text-xs text-neutral-muted">
              {form.offerings.items.length} offering
              {form.offerings.items.length === 1 ? '' : 's'} ·{' '}
              {form.process.steps.length} process step
              {form.process.steps.length === 1 ? '' : 's'}
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-sm font-semibold text-secondary">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {step !== 'review' ? (
          <ArrowPillButton
            type="button"
            size="sm"
            onClick={goNext}
            disabled={pending}
          >
            Continue
          </ArrowPillButton>
        ) : (
          <>
            <ArrowPillButton
              type="button"
              size="sm"
              variant="dark"
              disabled={pending}
              onClick={() => onSave('draft')}
            >
              Save as draft
            </ArrowPillButton>
            <ArrowPillButton
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => onSave('published')}
            >
              {pending ? 'Saving…' : 'Publish'}
            </ArrowPillButton>
          </>
        )}
        {step !== 'review' ? (
          <button
            type="button"
            className="text-sm font-semibold text-neutral-muted underline-offset-4 hover:underline"
            disabled={pending}
            onClick={() => onSave('draft')}
          >
            Save draft & exit
          </button>
        ) : null}
        {step === 'review' && initial?.id ? (
          <button
            type="button"
            className="text-sm font-semibold text-secondary underline-offset-4 hover:underline"
            disabled={pending}
            onClick={onDelete}
          >
            Delete service
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        className={`${fieldClass} min-h-[72px]`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
