'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { TextArea, SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { HomeContent, SectionIntro } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

function SectionFields({
  label,
  value,
  onChange,
}: {
  label: string
  value: SectionIntro
  onChange: (v: SectionIntro) => void
}) {
  return (
    <SiteCard title={label}>
      <TextField
        label="Eyebrow"
        value={value.eyebrow}
        onChange={(v) => onChange({ ...value, eyebrow: v })}
      />
      <TextField
        label="Title (before accent)"
        value={value.titleBefore}
        onChange={(v) => onChange({ ...value, titleBefore: v })}
      />
      <TextField
        label="Title accent"
        value={value.titleAccent}
        onChange={(v) => onChange({ ...value, titleAccent: v })}
      />
      <TextArea
        label="Body"
        value={value.body}
        onChange={(v) => onChange({ ...value, body: v })}
      />
    </SiteCard>
  )
}

export function HomeContentEditor({ initial }: { initial: HomeContent }) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveSiteContent('home', data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Home & marketing saved')
      router.refresh()
    })
  }

  const rows = [
    ['featured', 'Featured deals'] as const,
    ['highDemand', 'High demand'] as const,
    ['land', 'Land for sale'] as const,
    ['popularRentals', 'Popular rentals'] as const,
    ['commercial', 'Commercial'] as const,
    ['exploreAreas', 'Explore by area'] as const,
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Home & marketing</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          CTA strip, home carousel titles, section intros, and index page shells.
        </p>
      </div>

      <SiteCard title="CTA strip">
        <TextField
          label="Title"
          value={data.cta.title}
          onChange={(v) => setData({ ...data, cta: { ...data.cta, title: v } })}
        />
        <TextArea
          label="Body"
          value={data.cta.body}
          onChange={(v) => setData({ ...data, cta: { ...data.cta, body: v } })}
        />
        <TextField
          label="Button label"
          value={data.cta.buttonLabel}
          onChange={(v) =>
            setData({ ...data, cta: { ...data.cta, buttonLabel: v } })
          }
        />
        <TextField
          label="Button href"
          value={data.cta.buttonHref}
          onChange={(v) =>
            setData({ ...data, cta: { ...data.cta, buttonHref: v } })
          }
        />
      </SiteCard>

      <SiteCard title="Home listing carousels">
        {rows.map(([key, label]) => (
          <div
            key={key}
            className="space-y-2 rounded-xl border border-neutral-light/60 p-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
              {label}
            </p>
            <TextField
              label="Title"
              value={data.carousels[key].title}
              onChange={(v) =>
                setData({
                  ...data,
                  carousels: {
                    ...data.carousels,
                    [key]: { ...data.carousels[key], title: v },
                  },
                })
              }
            />
            <TextField
              label="Subtitle"
              value={data.carousels[key].subtitle}
              onChange={(v) =>
                setData({
                  ...data,
                  carousels: {
                    ...data.carousels,
                    [key]: { ...data.carousels[key], subtitle: v },
                  },
                })
              }
            />
          </div>
        ))}
      </SiteCard>

      <SectionFields
        label="Services section (home)"
        value={data.sections.services}
        onChange={(v) =>
          setData({
            ...data,
            sections: { ...data.sections, services: v },
          })
        }
      />
      <SectionFields
        label="Reviews section (home)"
        value={data.sections.reviews}
        onChange={(v) =>
          setData({
            ...data,
            sections: { ...data.sections, reviews: v },
          })
        }
      />
      <SectionFields
        label="Agents section (home)"
        value={data.sections.agents}
        onChange={(v) =>
          setData({
            ...data,
            sections: { ...data.sections, agents: v },
          })
        }
      />
      <SectionFields
        label="Insights section (home)"
        value={data.sections.insights}
        onChange={(v) =>
          setData({
            ...data,
            sections: { ...data.sections, insights: v },
          })
        }
      />

      <SiteCard title="/services index shell">
        <TextField
          label="Eyebrow"
          value={data.indexPages.services.eyebrow}
          onChange={(v) =>
            setData({
              ...data,
              indexPages: {
                ...data.indexPages,
                services: { ...data.indexPages.services, eyebrow: v },
              },
            })
          }
        />
        <TextField
          label="Title"
          value={data.indexPages.services.title}
          onChange={(v) =>
            setData({
              ...data,
              indexPages: {
                ...data.indexPages,
                services: { ...data.indexPages.services, title: v },
              },
            })
          }
        />
        <TextArea
          label="Body"
          value={data.indexPages.services.body}
          onChange={(v) =>
            setData({
              ...data,
              indexPages: {
                ...data.indexPages,
                services: { ...data.indexPages.services, body: v },
              },
            })
          }
        />
      </SiteCard>

      <SiteCard title="/insights index shell">
        <TextField
          label="Eyebrow"
          value={data.indexPages.insights.eyebrow}
          onChange={(v) =>
            setData({
              ...data,
              indexPages: {
                ...data.indexPages,
                insights: { ...data.indexPages.insights, eyebrow: v },
              },
            })
          }
        />
        <TextField
          label="Title"
          value={data.indexPages.insights.title}
          onChange={(v) =>
            setData({
              ...data,
              indexPages: {
                ...data.indexPages,
                insights: { ...data.indexPages.insights, title: v },
              },
            })
          }
        />
        <TextArea
          label="Body"
          value={data.indexPages.insights.body}
          onChange={(v) =>
            setData({
              ...data,
              indexPages: {
                ...data.indexPages,
                insights: { ...data.indexPages.insights, body: v },
              },
            })
          }
        />
      </SiteCard>

      {error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : null}
      <ArrowPillButton type="button" disabled={pending} onClick={save}>
        {pending ? 'Saving…' : 'Save home & marketing'}
      </ArrowPillButton>
    </div>
  )
}
