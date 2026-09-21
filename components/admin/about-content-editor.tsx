'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import { TextArea, SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { AboutContent } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

export function AboutContentEditor({ initial }: { initial: AboutContent }) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveSiteContent('about', data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('About page saved')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">About page</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Hero, story, video, approach, and FAQs on /about.
        </p>
      </div>

      <SiteCard title="Hero">
        <TextField
          label="Eyebrow"
          value={data.hero.eyebrow}
          onChange={(v) =>
            setData({ ...data, hero: { ...data.hero, eyebrow: v } })
          }
        />
        <TextArea
          label="Title"
          value={data.hero.title}
          onChange={(v) =>
            setData({ ...data, hero: { ...data.hero, title: v } })
          }
        />
        <TextField
          label="CTA label"
          value={data.hero.ctaLabel}
          onChange={(v) =>
            setData({ ...data, hero: { ...data.hero, ctaLabel: v } })
          }
        />
        <TextField
          label="Primary image URL"
          type="url"
          value={data.hero.images.primary}
          onChange={(v) =>
            setData({
              ...data,
              hero: {
                ...data.hero,
                images: { ...data.hero.images, primary: v },
              },
            })
          }
        />
        <TextField
          label="Secondary image URL"
          type="url"
          value={data.hero.images.secondary}
          onChange={(v) =>
            setData({
              ...data,
              hero: {
                ...data.hero,
                images: { ...data.hero.images, secondary: v },
              },
            })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Stat value"
            value={data.hero.statCard.value}
            onChange={(v) =>
              setData({
                ...data,
                hero: {
                  ...data.hero,
                  statCard: { ...data.hero.statCard, value: v },
                },
              })
            }
          />
          <TextField
            label="Stat label"
            value={data.hero.statCard.label}
            onChange={(v) =>
              setData({
                ...data,
                hero: {
                  ...data.hero,
                  statCard: { ...data.hero.statCard, label: v },
                },
              })
            }
          />
        </div>
        {data.hero.highlights.map((h, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-neutral-light/60 p-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
              Highlight {i + 1}
            </p>
            <TextField
              label="Title"
              value={h.title}
              onChange={(v) => {
                const highlights = [...data.hero.highlights]
                highlights[i] = { ...h, title: v }
                setData({ ...data, hero: { ...data.hero, highlights } })
              }}
            />
            <TextArea
              label="Description"
              value={h.description}
              onChange={(v) => {
                const highlights = [...data.hero.highlights]
                highlights[i] = { ...h, description: v }
                setData({ ...data, hero: { ...data.hero, highlights } })
              }}
            />
          </div>
        ))}
      </SiteCard>

      <SiteCard title="Story">
        <TextField
          label="Eyebrow"
          value={data.story.eyebrow}
          onChange={(v) =>
            setData({ ...data, story: { ...data.story, eyebrow: v } })
          }
        />
        <TextArea
          label="Title"
          value={data.story.title}
          onChange={(v) =>
            setData({ ...data, story: { ...data.story, title: v } })
          }
        />
        <TextArea
          label="Body"
          value={data.story.body}
          onChange={(v) =>
            setData({ ...data, story: { ...data.story, body: v } })
          }
          rows={4}
        />
        <TextField
          label="“What sets us apart” title"
          value={data.story.apartTitle}
          onChange={(v) =>
            setData({ ...data, story: { ...data.story, apartTitle: v } })
          }
        />
        <div>
          <Label>Apart items (one per line)</Label>
          <textarea
            className={`${fieldClass} resize-y`}
            rows={4}
            value={data.story.apartItems.join('\n')}
            onChange={(e) =>
              setData({
                ...data,
                story: {
                  ...data.story,
                  apartItems: e.target.value.split('\n').filter(Boolean),
                },
              })
            }
          />
        </div>
      </SiteCard>

      <SiteCard title="Video">
        <TextArea
          label="Title"
          value={data.video.title}
          onChange={(v) =>
            setData({ ...data, video: { ...data.video, title: v } })
          }
        />
        <TextField
          label="YouTube video ID"
          value={data.video.videoId}
          onChange={(v) =>
            setData({
              ...data,
              video: {
                ...data.video,
                videoId: v,
                videoUrl: `https://www.youtube.com/watch?v=${v}`,
                image: `https://i.ytimg.com/vi/${v}/maxresdefault.jpg`,
              },
            })
          }
        />
      </SiteCard>

      <SiteCard title="Approach">
        <TextField
          label="Eyebrow"
          value={data.approach.eyebrow}
          onChange={(v) =>
            setData({
              ...data,
              approach: { ...data.approach, eyebrow: v },
            })
          }
        />
        <TextArea
          label="Title"
          value={data.approach.title}
          onChange={(v) =>
            setData({ ...data, approach: { ...data.approach, title: v } })
          }
        />
        <TextArea
          label="Body"
          value={data.approach.body}
          onChange={(v) =>
            setData({ ...data, approach: { ...data.approach, body: v } })
          }
        />
        <TextField
          label="Side image URL"
          type="url"
          value={data.approach.image}
          onChange={(v) =>
            setData({ ...data, approach: { ...data.approach, image: v } })
          }
        />
        <p className="text-[11px] text-neutral-muted">
          {data.approach.items.length} approach cards — edit titles/descriptions
          below.
        </p>
        {data.approach.items.map((item, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-neutral-light/60 p-3"
          >
            <TextField
              label={`Card ${i + 1} title`}
              value={item.title}
              onChange={(v) => {
                const items = [...data.approach.items]
                items[i] = { ...item, title: v }
                setData({
                  ...data,
                  approach: { ...data.approach, items },
                })
              }}
            />
            <TextArea
              label="Description"
              value={item.description}
              onChange={(v) => {
                const items = [...data.approach.items]
                items[i] = { ...item, description: v }
                setData({
                  ...data,
                  approach: { ...data.approach, items },
                })
              }}
            />
          </div>
        ))}
      </SiteCard>

      <SiteCard title="FAQs">
        {data.faqs.map((faq, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-neutral-light/60 p-3"
          >
            <TextField
              label={`Question ${i + 1}`}
              value={faq.question}
              onChange={(v) => {
                const faqs = [...data.faqs]
                faqs[i] = { ...faq, question: v }
                setData({ ...data, faqs })
              }}
            />
            <TextArea
              label="Answer"
              value={faq.answer}
              onChange={(v) => {
                const faqs = [...data.faqs]
                faqs[i] = { ...faq, answer: v }
                setData({ ...data, faqs })
              }}
              rows={3}
            />
          </div>
        ))}
      </SiteCard>

      {error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : null}
      <ArrowPillButton type="button" disabled={pending} onClick={save}>
        {pending ? 'Saving…' : 'Save about page'}
      </ArrowPillButton>
    </div>
  )
}
