'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import {
  ContentStepHeader,
  fieldClass,
  Label,
} from '@/components/admin/content-chrome'
import { deleteInsight, saveInsight } from '@/lib/content/actions'
import { slugifyContentTitle } from '@/lib/content/map'
import type {
  ContentStatus,
  InsightPostRow,
  InsightWriteInput,
} from '@/lib/content/types'
import {
  BLOG_CATEGORY_LABEL,
  type BlogCategory,
  type BlogContentBlock,
} from '@/lib/blog'

type Step = 'meta' | 'body' | 'review'

const STEPS: Step[] = ['meta', 'body', 'review']

const STEP_TITLE: Record<Step, string> = {
  meta: 'Meta',
  body: 'Body',
  review: 'Review',
}

const CATEGORIES = Object.keys(BLOG_CATEGORY_LABEL) as BlogCategory[]

function emptyDraft(initial?: InsightPostRow): InsightWriteInput {
  if (initial) {
    return {
      slug: initial.slug,
      title: initial.title,
      excerpt: initial.excerpt,
      description: initial.description,
      cover_image: initial.cover_image,
      category: initial.category,
      read_time_minutes: initial.read_time_minutes,
      content: Array.isArray(initial.content) ? [...initial.content] : [],
      status: initial.status,
      published_at: initial.published_at?.slice(0, 10) || '',
    }
  }
  return {
    slug: '',
    title: '',
    excerpt: '',
    description: '',
    cover_image: '',
    category: 'market-update',
    read_time_minutes: 5,
    content: [],
    status: 'draft',
    published_at: '',
  }
}

function newBlock(type: BlogContentBlock['type']): BlogContentBlock {
  if (type === 'list') {
    return { type: 'list', intro: '', items: [''], outro: '' }
  }
  return { type, text: '' }
}

export function InsightEditor({ initial }: { initial?: InsightPostRow }) {
  const router = useRouter()
  const seed = useMemo(() => emptyDraft(initial), [initial])
  const [step, setStep] = useState<Step>('meta')
  const [form, setForm] = useState(seed)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const stepIndex = STEPS.indexOf(step)

  function patch<K extends keyof InsightWriteInput>(
    key: K,
    value: InsightWriteInput[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !slugTouched) {
        next.slug = slugifyContentTitle(String(value))
      }
      return next
    })
  }

  function canContinue(): string | null {
    if (step === 'meta') {
      if (!form.title.trim()) return 'Title is required.'
      if (!form.slug.trim()) return 'Slug is required.'
    }
    return null
  }

  function goNext() {
    const block = canContinue()
    if (block) {
      setError(block)
      return
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

  function publishBlockers(): string | null {
    if (!form.title.trim() || !form.slug.trim()) {
      return 'Title and slug are required.'
    }
    if (!form.cover_image.trim()) return 'Cover image is required to publish.'
    if (!form.content.length) return 'Add at least one content block before publishing.'
    return null
  }

  function onSave(status: ContentStatus) {
    setError(null)
    if (status === 'published') {
      const block = publishBlockers()
      if (block) {
        setError(block)
        return
      }
    }
    startTransition(async () => {
      const payload: InsightWriteInput = {
        ...form,
        slug: form.slug.trim() || slugifyContentTitle(form.title),
        published_at: form.published_at || null,
        status,
      }
      const result = await saveInsight(payload, initial?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/insights/')
      router.refresh()
    })
  }

  function onDelete() {
    if (!initial?.id) return
    if (!window.confirm('Delete this insight permanently?')) return
    startTransition(async () => {
      const result = await deleteInsight(initial.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/insights/')
      router.refresh()
    })
  }

  function updateBlock(index: number, block: BlogContentBlock) {
    setForm((prev) => {
      const content = [...prev.content]
      content[index] = block
      return { ...prev, content }
    })
  }

  function removeBlock(index: number) {
    setForm((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }))
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setForm((prev) => {
      const content = [...prev.content]
      const target = index + dir
      if (target < 0 || target >= content.length) return prev
      ;[content[index], content[target]] = [content[target], content[index]]
      return { ...prev, content }
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
        {step === 'meta' ? (
          <div className="flex flex-col gap-4">
            <div>
              <Label>Title</Label>
              <input
                className={fieldClass}
                value={form.title}
                onChange={(e) => patch('title', e.target.value)}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <input
                className={fieldClass}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  patch('slug', e.target.value)
                }}
              />
            </div>
            <div>
              <Label>Excerpt</Label>
              <textarea
                className={`${fieldClass} min-h-[72px]`}
                value={form.excerpt}
                onChange={(e) => patch('excerpt', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className={`${fieldClass} min-h-[72px]`}
                value={form.description}
                onChange={(e) => patch('description', e.target.value)}
              />
            </div>
            <div>
              <Label>Cover image URL</Label>
              <input
                className={fieldClass}
                value={form.cover_image}
                onChange={(e) => patch('cover_image', e.target.value)}
              />
              {form.cover_image ? (
                <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-light">
                  <Image
                    src={form.cover_image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="640px"
                  />
                </div>
              ) : null}
            </div>
            <div>
              <Label>Category</Label>
              <select
                className={fieldClass}
                value={form.category}
                onChange={(e) =>
                  patch('category', e.target.value as BlogCategory)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {BLOG_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Read time (minutes)</Label>
              <input
                type="number"
                min={1}
                className={fieldClass}
                value={form.read_time_minutes}
                onChange={(e) =>
                  patch('read_time_minutes', Number(e.target.value) || 5)
                }
              />
            </div>
            <div>
              <Label>Published date</Label>
              <input
                type="date"
                className={fieldClass}
                value={form.published_at || ''}
                onChange={(e) => patch('published_at', e.target.value)}
              />
            </div>
          </div>
        ) : null}

        {step === 'body' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {(['lead', 'p', 'h2', 'list'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      content: [...prev.content, newBlock(type)],
                    }))
                  }
                  className="rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-neutral-muted hover:bg-pill-soft hover:text-ink"
                >
                  + {type}
                </button>
              ))}
            </div>
            <ul className="flex flex-col gap-3">
              {form.content.map((block, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
                      {block.type}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(i, -1)}
                        className="rounded px-1.5 text-[10px] font-bold text-neutral-muted"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(i, 1)}
                        className="rounded px-1.5 text-[10px] font-bold text-neutral-muted"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(i)}
                        className="rounded px-1.5 text-[10px] font-bold text-secondary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {block.type === 'list' ? (
                    <div className="flex flex-col gap-2">
                      <div>
                        <Label>Intro</Label>
                        <textarea
                          className={`${fieldClass} min-h-[60px]`}
                          value={block.intro || ''}
                          onChange={(e) =>
                            updateBlock(i, { ...block, intro: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Items (one per line)</Label>
                        <textarea
                          className={`${fieldClass} min-h-[80px]`}
                          value={block.items.join('\n')}
                          onChange={(e) =>
                            updateBlock(i, {
                              ...block,
                              items: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Outro</Label>
                        <textarea
                          className={`${fieldClass} min-h-[60px]`}
                          value={block.outro || ''}
                          onChange={(e) =>
                            updateBlock(i, { ...block, outro: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <textarea
                      className={`${fieldClass} min-h-[80px]`}
                      value={block.text}
                      onChange={(e) =>
                        updateBlock(i, { ...block, text: e.target.value })
                      }
                    />
                  )}
                </li>
              ))}
              {form.content.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-neutral-light px-4 py-8 text-center text-sm text-neutral-muted">
                  Add content blocks to build the article body.
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 text-sm">
              <p className="font-bold text-ink">{form.title || 'Untitled'}</p>
              <p className="mt-1 text-neutral-muted">
                {BLOG_CATEGORY_LABEL[form.category]} · {form.read_time_minutes}{' '}
                min · /{form.slug || slugifyContentTitle(form.title)}/
              </p>
              <p className="mt-3 text-neutral-muted">{form.excerpt}</p>
              <p className="mt-2 text-xs text-neutral-muted">
                {form.content.length} content block
                {form.content.length === 1 ? '' : 's'}
              </p>
            </div>
            {publishBlockers() ? (
              <p className="text-sm font-semibold text-secondary">
                {publishBlockers()}
              </p>
            ) : (
              <p className="text-sm font-semibold text-accent-deep">
                Ready to publish
              </p>
            )}
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
              disabled={pending || Boolean(publishBlockers())}
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
            Delete insight
          </button>
        ) : null}
      </div>
    </div>
  )
}
