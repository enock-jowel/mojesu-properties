'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import { deleteAgent, saveAgent } from '@/lib/content/actions'
import type {
  AgentRow,
  AgentWriteInput,
  ContentStatus,
} from '@/lib/content/types'

function emptyDraft(initial?: AgentRow): AgentWriteInput {
  if (initial) {
    return {
      name: initial.name,
      role: initial.role,
      photo_url: initial.photo_url,
      profile_href: initial.profile_href,
      instagram_url: initial.instagram_url,
      linkedin_url: initial.linkedin_url,
      phone: initial.phone,
      status: initial.status,
      sort_order: initial.sort_order,
    }
  }
  return {
    name: '',
    role: '',
    photo_url: '',
    profile_href: '',
    instagram_url: '',
    linkedin_url: '',
    phone: '',
    status: 'draft',
    sort_order: 0,
  }
}

export function AgentEditor({ initial }: { initial?: AgentRow }) {
  const router = useRouter()
  const seed = useMemo(() => emptyDraft(initial), [initial])
  const [form, setForm] = useState(seed)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function patch<K extends keyof AgentWriteInput>(
    key: K,
    value: AgentWriteInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onSave(status: ContentStatus) {
    setError(null)
    startTransition(async () => {
      const result = await saveAgent({ ...form, status }, initial?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/agents/')
      router.refresh()
    })
  }

  function onDelete() {
    if (!initial?.id) return
    if (!window.confirm('Delete this agent permanently?')) return
    startTransition(async () => {
      const result = await deleteAgent(initial.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/content/agents/')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-lg font-extrabold text-ink sm:text-xl">
        {initial ? 'Edit agent' : 'New agent'}
      </h1>

      <div className="mt-5 flex flex-col gap-4">
        <Field label="Name" value={form.name} onChange={(v) => patch('name', v)} />
        <Field label="Role" value={form.role} onChange={(v) => patch('role', v)} />
        <Field
          label="Photo URL"
          value={form.photo_url}
          onChange={(v) => patch('photo_url', v)}
        />
        {form.photo_url ? (
          <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-neutral-light">
            <Image
              src={form.photo_url}
              alt=""
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        ) : null}
        <Field
          label="Profile href"
          value={form.profile_href || ''}
          onChange={(v) => patch('profile_href', v || null)}
        />
        <Field
          label="Instagram URL"
          value={form.instagram_url || ''}
          onChange={(v) => patch('instagram_url', v || null)}
        />
        <Field
          label="LinkedIn URL"
          value={form.linkedin_url || ''}
          onChange={(v) => patch('linkedin_url', v || null)}
        />
        <Field
          label="Phone"
          value={form.phone || ''}
          onChange={(v) => patch('phone', v || null)}
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
            Delete agent
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
