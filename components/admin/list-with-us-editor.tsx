'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import { TextArea, SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { ListWithUsContent } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

export function ListWithUsEditor({ initial }: { initial: ListWithUsContent }) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveSiteContent('list_with_us', data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('List with us page saved')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">List with us</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Marketing copy for /list-with-us (form fields stay in code).
        </p>
      </div>

      <SiteCard title="Hero & enquiry card">
        <TextField
          label="Name / H1"
          value={data.name}
          onChange={(v) => setData({ ...data, name: v })}
        />
        <TextArea
          label="Hero description"
          value={data.heroDescription}
          onChange={(v) => setData({ ...data, heroDescription: v })}
          rows={3}
        />
        <TextField
          label="Hero image URL"
          type="url"
          value={data.image}
          onChange={(v) => setData({ ...data, image: v })}
        />
        <TextField
          label="Image alt"
          value={data.imageAlt}
          onChange={(v) => setData({ ...data, imageAlt: v })}
        />
        <TextField
          label="Card title"
          value={data.cardTitle}
          onChange={(v) => setData({ ...data, cardTitle: v })}
        />
        <TextArea
          label="Card subtitle"
          value={data.cardSubtitle}
          onChange={(v) => setData({ ...data, cardSubtitle: v })}
        />
        <TextField
          label="CTA label"
          value={data.ctaLabel}
          onChange={(v) => setData({ ...data, ctaLabel: v })}
        />
        <TextArea
          label="Footer note"
          value={data.footerNote}
          onChange={(v) => setData({ ...data, footerNote: v })}
        />
      </SiteCard>

      <SiteCard title="What we do">
        <TextField
          label="Title"
          value={data.whatWeDo.title}
          onChange={(v) =>
            setData({
              ...data,
              whatWeDo: { ...data.whatWeDo, title: v },
            })
          }
        />
        <TextArea
          label="Body"
          value={data.whatWeDo.body}
          onChange={(v) =>
            setData({
              ...data,
              whatWeDo: { ...data.whatWeDo, body: v },
            })
          }
          rows={4}
        />
        <TextField
          label="Image URL"
          type="url"
          value={data.whatWeDo.image}
          onChange={(v) =>
            setData({
              ...data,
              whatWeDo: { ...data.whatWeDo, image: v },
            })
          }
        />
      </SiteCard>

      <SiteCard title="Offerings">
        <TextField
          label="Section title"
          value={data.offerings.title}
          onChange={(v) =>
            setData({
              ...data,
              offerings: { ...data.offerings, title: v },
            })
          }
        />
        <TextArea
          label="Section body"
          value={data.offerings.body}
          onChange={(v) =>
            setData({
              ...data,
              offerings: { ...data.offerings, body: v },
            })
          }
        />
        {data.offerings.items.map((item, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-neutral-light/60 p-3"
          >
            <TextField
              label={`Offering ${i + 1} title`}
              value={item.title}
              onChange={(v) => {
                const items = [...data.offerings.items]
                items[i] = { ...item, title: v }
                setData({
                  ...data,
                  offerings: { ...data.offerings, items },
                })
              }}
            />
            <TextArea
              label="Description"
              value={item.description}
              onChange={(v) => {
                const items = [...data.offerings.items]
                items[i] = { ...item, description: v }
                setData({
                  ...data,
                  offerings: { ...data.offerings, items },
                })
              }}
            />
          </div>
        ))}
      </SiteCard>

      <SiteCard title="Process">
        <TextField
          label="Section title"
          value={data.process.title}
          onChange={(v) =>
            setData({
              ...data,
              process: { ...data.process, title: v },
            })
          }
        />
        <TextArea
          label="Section body"
          value={data.process.body}
          onChange={(v) =>
            setData({
              ...data,
              process: { ...data.process, body: v },
            })
          }
        />
        {data.process.steps.map((step, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-neutral-light/60 p-3"
          >
            <TextField
              label={`Step ${i + 1} title`}
              value={step.title}
              onChange={(v) => {
                const steps = [...data.process.steps]
                steps[i] = { ...step, title: v }
                setData({
                  ...data,
                  process: { ...data.process, steps },
                })
              }}
            />
            <TextArea
              label="Description"
              value={step.description}
              onChange={(v) => {
                const steps = [...data.process.steps]
                steps[i] = { ...step, description: v }
                setData({
                  ...data,
                  process: { ...data.process, steps },
                })
              }}
            />
          </div>
        ))}
      </SiteCard>

      <SiteCard title="Related services">
        <div>
          <Label>Service slugs (comma-separated)</Label>
          <input
            className={fieldClass}
            value={data.relatedServiceSlugs.join(', ')}
            onChange={(e) =>
              setData({
                ...data,
                relatedServiceSlugs: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      </SiteCard>

      {error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : null}
      <ArrowPillButton type="button" disabled={pending} onClick={save}>
        {pending ? 'Saving…' : 'Save list with us'}
      </ArrowPillButton>
    </div>
  )
}
