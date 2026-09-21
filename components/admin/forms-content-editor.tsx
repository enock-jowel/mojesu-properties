'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { SiteCard, TextArea, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { FormsContent } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

function LinesField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string[]
  onChange: (v: string[]) => void
  hint?: string
}) {
  return (
    <TextArea
      label={label}
      value={value.join('\n')}
      onChange={(v) =>
        onChange(
          v
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
      rows={Math.max(3, value.length + 1)}
      hint={hint || 'One item per line'}
    />
  )
}

export function FormsContentEditor({ initial }: { initial: FormsContent }) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveSiteContent('forms', data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Form copy saved')
      router.refresh()
    })
  }

  const c = data.contact
  const l = data.listWithUs
  const v = data.viewing

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Form microcopy</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Labels, placeholders, steps, and validation for contact, list-with-us,
          and viewing booking forms.
        </p>
      </div>

      <SiteCard title="Contact form — idle & success">
        <TextField
          label="Idle title"
          value={c.idleTitle}
          onChange={(idleTitle) =>
            setData({ ...data, contact: { ...c, idleTitle } })
          }
        />
        <TextArea
          label="Idle body"
          value={c.idleBody}
          onChange={(idleBody) =>
            setData({ ...data, contact: { ...c, idleBody } })
          }
        />
        <TextField
          label="Idle CTA"
          value={c.idleCta}
          onChange={(idleCta) =>
            setData({ ...data, contact: { ...c, idleCta } })
          }
        />
        <TextField
          label="Success title"
          value={c.successTitle}
          onChange={(successTitle) =>
            setData({ ...data, contact: { ...c, successTitle } })
          }
        />
        <TextArea
          label="Success body"
          value={c.successBody}
          onChange={(successBody) =>
            setData({ ...data, contact: { ...c, successBody } })
          }
        />
        <TextField
          label="Send another"
          value={c.successAgain}
          onChange={(successAgain) =>
            setData({ ...data, contact: { ...c, successAgain } })
          }
        />
        <TextField
          label="Toast success"
          value={c.toastSuccess}
          onChange={(toastSuccess) =>
            setData({ ...data, contact: { ...c, toastSuccess } })
          }
        />
      </SiteCard>

      <SiteCard title="Contact form — steps & fields">
        <TextField
          label="Step 1"
          value={c.steps.step1}
          onChange={(step1) =>
            setData({
              ...data,
              contact: { ...c, steps: { ...c.steps, step1 } },
            })
          }
        />
        <TextField
          label="Step 2"
          value={c.steps.step2}
          onChange={(step2) =>
            setData({
              ...data,
              contact: { ...c, steps: { ...c.steps, step2 } },
            })
          }
        />
        <TextField
          label="Step 3"
          value={c.steps.step3}
          onChange={(step3) =>
            setData({
              ...data,
              contact: { ...c, steps: { ...c.steps, step3 } },
            })
          }
        />
        <LinesField
          label="Purpose options"
          value={c.purposes}
          onChange={(purposes) =>
            setData({ ...data, contact: { ...c, purposes } })
          }
        />
        <TextField
          label="List-property purpose (redirects)"
          value={c.listPropertyPurpose}
          onChange={(listPropertyPurpose) =>
            setData({ ...data, contact: { ...c, listPropertyPurpose } })
          }
        />
        <TextField
          label="Label — purpose"
          value={c.labelPurpose}
          onChange={(labelPurpose) =>
            setData({ ...data, contact: { ...c, labelPurpose } })
          }
        />
        <TextField
          label="Label — area"
          value={c.labelArea}
          onChange={(labelArea) =>
            setData({ ...data, contact: { ...c, labelArea } })
          }
        />
        <TextField
          label="Label — message"
          value={c.labelMessage}
          onChange={(labelMessage) =>
            setData({ ...data, contact: { ...c, labelMessage } })
          }
        />
        <TextField
          label="Placeholder — area"
          value={c.placeholderArea}
          onChange={(placeholderArea) =>
            setData({ ...data, contact: { ...c, placeholderArea } })
          }
        />
        <TextField
          label="Placeholder — message"
          value={c.placeholderMessage}
          onChange={(placeholderMessage) =>
            setData({ ...data, contact: { ...c, placeholderMessage } })
          }
        />
        <TextField
          label="Placeholder — name"
          value={c.placeholderName}
          onChange={(placeholderName) =>
            setData({ ...data, contact: { ...c, placeholderName } })
          }
        />
        <TextField
          label="Placeholder — email"
          value={c.placeholderEmail}
          onChange={(placeholderEmail) =>
            setData({ ...data, contact: { ...c, placeholderEmail } })
          }
        />
        <TextField
          label="Placeholder — phone"
          value={c.placeholderPhone}
          onChange={(placeholderPhone) =>
            setData({ ...data, contact: { ...c, placeholderPhone } })
          }
        />
        <TextField
          label="Continue"
          value={c.continueLabel}
          onChange={(continueLabel) =>
            setData({ ...data, contact: { ...c, continueLabel } })
          }
        />
        <TextField
          label="Confirm"
          value={c.confirmLabel}
          onChange={(confirmLabel) =>
            setData({ ...data, contact: { ...c, confirmLabel } })
          }
        />
        <TextField
          label="Sending"
          value={c.sendingLabel}
          onChange={(sendingLabel) =>
            setData({ ...data, contact: { ...c, sendingLabel } })
          }
        />
      </SiteCard>

      <SiteCard title="Contact form — validation errors">
        {(
          [
            ['purpose', 'Purpose'],
            ['area', 'Area'],
            ['message', 'Message'],
            ['name', 'Name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
          ] as const
        ).map(([key, label]) => (
          <TextField
            key={key}
            label={label}
            value={c.errors[key]}
            onChange={(v) =>
              setData({
                ...data,
                contact: { ...c, errors: { ...c.errors, [key]: v } },
              })
            }
          />
        ))}
      </SiteCard>

      <SiteCard title="List with us — idle & confirm">
        <LinesField
          label="Idle bullets"
          value={l.idleBullets}
          onChange={(idleBullets) =>
            setData({ ...data, listWithUs: { ...l, idleBullets } })
          }
        />
        <LinesField
          label="Best times to reach"
          value={l.bestTimes}
          onChange={(bestTimes) =>
            setData({ ...data, listWithUs: { ...l, bestTimes } })
          }
        />
        <TextField
          label="Confirm title"
          value={l.confirmTitle}
          onChange={(confirmTitle) =>
            setData({ ...data, listWithUs: { ...l, confirmTitle } })
          }
        />
        <TextField
          label="Confirm subtitle"
          value={l.confirmSubtitle}
          onChange={(confirmSubtitle) =>
            setData({ ...data, listWithUs: { ...l, confirmSubtitle } })
          }
        />
        <TextArea
          label="Confirm body"
          value={l.confirmBody}
          onChange={(confirmBody) =>
            setData({ ...data, listWithUs: { ...l, confirmBody } })
          }
        />
        <TextArea
          label="Confirm note"
          value={l.confirmNote}
          onChange={(confirmNote) =>
            setData({ ...data, listWithUs: { ...l, confirmNote } })
          }
        />
        <TextField
          label="WhatsApp CTA"
          value={l.whatsappCta}
          onChange={(whatsappCta) =>
            setData({ ...data, listWithUs: { ...l, whatsappCta } })
          }
        />
        <TextField
          label="Done"
          value={l.doneLabel}
          onChange={(doneLabel) =>
            setData({ ...data, listWithUs: { ...l, doneLabel } })
          }
        />
      </SiteCard>

      <SiteCard title="List with us — steps & labels">
        <TextField
          label="Step 1"
          value={l.steps.step1}
          onChange={(step1) =>
            setData({
              ...data,
              listWithUs: { ...l, steps: { ...l.steps, step1 } },
            })
          }
        />
        <TextField
          label="Step 2"
          value={l.steps.step2}
          onChange={(step2) =>
            setData({
              ...data,
              listWithUs: { ...l, steps: { ...l.steps, step2 } },
            })
          }
        />
        <TextField
          label="Step 3"
          value={l.steps.step3}
          onChange={(step3) =>
            setData({
              ...data,
              listWithUs: { ...l, steps: { ...l.steps, step3 } },
            })
          }
        />
        {(
          Object.keys(l.labels) as (keyof typeof l.labels)[]
        ).map((key) => (
          <TextField
            key={key}
            label={`Label — ${key}`}
            value={l.labels[key]}
            onChange={(v) =>
              setData({
                ...data,
                listWithUs: {
                  ...l,
                  labels: { ...l.labels, [key]: v },
                },
              })
            }
          />
        ))}
        {(
          Object.keys(l.placeholders) as (keyof typeof l.placeholders)[]
        ).map((key) => (
          <TextField
            key={key}
            label={`Placeholder — ${key}`}
            value={l.placeholders[key]}
            onChange={(val) =>
              setData({
                ...data,
                listWithUs: {
                  ...l,
                  placeholders: { ...l.placeholders, [key]: val },
                },
              })
            }
          />
        ))}
      </SiteCard>

      <SiteCard title="List with us — validation errors">
        {(
          Object.keys(l.errors) as (keyof typeof l.errors)[]
        ).map((key) => (
          <TextField
            key={key}
            label={key}
            value={l.errors[key]}
            onChange={(val) =>
              setData({
                ...data,
                listWithUs: {
                  ...l,
                  errors: { ...l.errors, [key]: val },
                },
              })
            }
          />
        ))}
      </SiteCard>

      <SiteCard title="Viewing booking form">
        <TextField
          label="Idle title"
          value={v.idleTitle}
          onChange={(idleTitle) =>
            setData({ ...data, viewing: { ...v, idleTitle } })
          }
        />
        <TextField
          label="Idle CTA"
          value={v.idleCta}
          onChange={(idleCta) =>
            setData({ ...data, viewing: { ...v, idleCta } })
          }
        />
        <TextField
          label="Confirm booking"
          value={v.confirmBooking}
          onChange={(confirmBooking) =>
            setData({ ...data, viewing: { ...v, confirmBooking } })
          }
        />
        <TextField
          label="Sending"
          value={v.sendingLabel}
          onChange={(sendingLabel) =>
            setData({ ...data, viewing: { ...v, sendingLabel } })
          }
        />
        <TextField
          label="Step 1"
          value={v.steps.step1}
          onChange={(step1) =>
            setData({
              ...data,
              viewing: { ...v, steps: { ...v.steps, step1 } },
            })
          }
        />
        <TextField
          label="Step 2"
          value={v.steps.step2}
          onChange={(step2) =>
            setData({
              ...data,
              viewing: { ...v, steps: { ...v.steps, step2 } },
            })
          }
        />
        <TextField
          label="Step 3"
          value={v.steps.step3}
          onChange={(step3) =>
            setData({
              ...data,
              viewing: { ...v, steps: { ...v.steps, step3 } },
            })
          }
        />
        <LinesField
          label="Time slots"
          value={v.timeSlots}
          onChange={(timeSlots) =>
            setData({ ...data, viewing: { ...v, timeSlots } })
          }
        />
        <TextField
          label="Placeholder — name"
          value={v.placeholders.name}
          onChange={(name) =>
            setData({
              ...data,
              viewing: {
                ...v,
                placeholders: { ...v.placeholders, name },
              },
            })
          }
        />
        <TextField
          label="Placeholder — phone"
          value={v.placeholders.phone}
          onChange={(phone) =>
            setData({
              ...data,
              viewing: {
                ...v,
                placeholders: { ...v.placeholders, phone },
              },
            })
          }
        />
        <TextField
          label="Placeholder — email"
          value={v.placeholders.email}
          onChange={(email) =>
            setData({
              ...data,
              viewing: {
                ...v,
                placeholders: { ...v.placeholders, email },
              },
            })
          }
        />
        {(
          Object.keys(v.errors) as (keyof typeof v.errors)[]
        ).map((key) => (
          <TextField
            key={key}
            label={`Error — ${key}`}
            value={v.errors[key]}
            onChange={(val) =>
              setData({
                ...data,
                viewing: {
                  ...v,
                  errors: { ...v.errors, [key]: val },
                },
              })
            }
          />
        ))}
      </SiteCard>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ArrowPillButton onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save form copy'}
      </ArrowPillButton>
    </div>
  )
}
