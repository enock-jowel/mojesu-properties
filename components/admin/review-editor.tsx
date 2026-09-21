'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import { deleteReview, saveReview } from '@/lib/content/actions'
import type {
  ContentStatus,
  ReviewRow,
  ReviewWriteInput,
} from '@/lib/content/types'
import { REVIEW_RELATED_LABEL, type ReviewRelatedTo } from '@/lib/reviews'

const RELATED_OPTIONS = Object.keys(REVIEW_RELATED_LABEL) as ReviewRelatedTo[]

function emptyDraft(initial?: ReviewRow): ReviewWriteInput {
  if (initial) {
    return {
      author_name: initial.author_name,
      role: initial.role,
      avatar_url: initial.avatar_url,
      photo_url: initial.photo_url,
      rating: initial.rating as ReviewWriteInput['rating'],
      quote: initial.quote,
      related_to: initial.related_to,
      featured: initial.featured,
      status: initial.status,
      review_date: initial.review_date.slice(0, 10),
    }
  }
  return {
    author_name: '',
    role: '',
    avatar_url: '',
    photo_url: '',
    rating: 5,
    quote: '',
    related_to: 'other',
    featured: false,
    status: 'draft',
    review_date: new Date().toISOString().slice(0, 10),
  }
}

export function ReviewEditor({ initial }: { initial?: ReviewRow }) {
  const router = useRouter()
  const seed = useMemo(() => emptyDraft(initial), [initial])
  const [form, setForm] = useState(seed)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function patch<K extends keyof ReviewWriteInput>(
    key: K,
    value: ReviewWriteInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onSave(status: ContentStatus) {
    setError(null)
    startTransition(async () => {
      const result = await saveReview({ ...form, status }, initial?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/reviews/')
      router.refresh()
    })
  }

  function onDelete() {
    if (!initial?.id) return
    if (!window.confirm('Delete this review permanently?')) return
    startTransition(async () => {
      const result = await deleteReview(initial.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/reviews/')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-lg font-extrabold text-ink sm:text-xl">
        {initial ? 'Edit review' : 'New review'}
      </h1>

      <div className="mt-5 flex flex-col gap-4">
        <Field
          label="Author name"
          value={form.author_name}
          onChange={(v) => patch('author_name', v)}
        />
        <Field label="Role" value={form.role} onChange={(v) => patch('role', v)} />
        <Field
          label="Photo URL"
          value={form.photo_url}
          onChange={(v) => patch('photo_url', v)}
        />
        {form.photo_url ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-neutral-light">
            <Image
              src={form.photo_url}
              alt=""
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        ) : null}
        <Field
          label="Avatar URL (optional)"
          value={form.avatar_url || ''}
          onChange={(v) => patch('avatar_url', v || null)}
        />
        <div>
          <Label>Rating</Label>
          <select
            className={fieldClass}
            value={form.rating}
            onChange={(e) =>
              patch('rating', Number(e.target.value) as ReviewWriteInput['rating'])
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Quote</Label>
          <textarea
            className={`${fieldClass} min-h-[100px]`}
            value={form.quote}
            onChange={(e) => patch('quote', e.target.value)}
          />
        </div>
        <div>
          <Label>Related to</Label>
          <select
            className={fieldClass}
            value={form.related_to}
            onChange={(e) =>
              patch('related_to', e.target.value as ReviewRelatedTo)
            }
          >
            {RELATED_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {REVIEW_RELATED_LABEL[key]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => patch('featured', e.target.checked)}
          />
          Featured review
        </label>
        <div>
          <Label>Review date</Label>
          <input
            type="date"
            className={fieldClass}
            value={form.review_date}
            onChange={(e) => patch('review_date', e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
          <select
            className={fieldClass}
            value={form.status}
            onChange={(e) => patch('status', e.target.value as ContentStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-semibold text-secondary">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
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
        {initial?.id ? (
          <button
            type="button"
            className="text-sm font-semibold text-secondary underline-offset-4 hover:underline"
            disabled={pending}
            onClick={onDelete}
          >
            Delete review
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
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
