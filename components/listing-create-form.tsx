'use client'

import { useMemo, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import {
  MIN_LISTING_IMAGES,
  listingImageProgressMessage,
  resolveListingStatus,
  validateListingImages,
} from '@/lib/listing-validation'
import { showToast } from '@/lib/toast'
import { ArrowPillButton } from '@/components/arrow-pill-button'

type Photo = { id: string; src: string; alt: string }

const API_URL = process.env.NEXT_PUBLIC_LISTINGS_API_URL ?? '/api/listings'

/**
 * Agent-facing listing creation form.
 * Blocks publish when fewer than MIN_LISTING_IMAGES photos are attached.
 */
export function ListingCreateForm() {
  const [title, setTitle] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [urlDraft, setUrlDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [intent, setIntent] = useState<'draft' | 'publish'>('publish')
  const [touched, setTouched] = useState(false)

  const validation = useMemo(() => validateListingImages(photos), [photos])
  const status = resolveListingStatus(photos.length)

  function addUrlPhoto() {
    const src = urlDraft.trim()
    if (!src) return
    setPhotos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), src, alt: title || 'Listing photo' },
    ])
    setUrlDraft('')
  }

  function onFiles(files: FileList | null) {
    if (!files?.length) return
    const next: Photo[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      next.push({
        id: crypto.randomUUID(),
        src: URL.createObjectURL(file),
        alt: file.name,
      })
    })
    if (next.length) setPhotos((prev) => [...prev, ...next])
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)

    if (title.trim().length < 3) {
      showToast('Enter a listing title')
      return
    }

    if (intent === 'publish' && !validation.ok) {
      showToast(validation.message ?? listingImageProgressMessage(photos.length))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          images: photos.map((p, i) => ({
            url: p.src,
            alt: p.alt,
            isCover: i === 0,
          })),
          publish: intent === 'publish',
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        showToast(data?.error ?? 'Could not save listing. Please try again.')
        return
      }

      const data = (await res.json()) as { status: string }
      showToast(
        data.status === 'published'
          ? 'Listing published'
          : 'Listing saved as draft',
      )
      setTitle('')
      setPhotos([])
      setTouched(false)
    } catch {
      showToast('Network error — try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl rounded-2xl border border-neutral-light bg-surface p-6 sm:p-8"
    >
      <h1 className="text-2xl font-extrabold text-ink">New listing</h1>
      <p className="mt-1 text-sm text-neutral-muted">
        Publish requires at least {MIN_LISTING_IMAGES} photos. Incomplete
        listings stay as draft and stay off the public grid.
      </p>

      <label className="mb-1.5 mt-6 block text-sm font-bold text-ink">
        Title
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Modern 2 Bedroom Apartment — Ntinda"
        className="w-full rounded-xl border border-neutral-light bg-surface-alt px-4 py-3 text-[15px] text-ink outline-none focus:border-primary"
      />

      <div className="mt-6">
        <p className="text-sm font-bold text-ink">Photos</p>
        <p
          className={`mt-1 text-sm ${
            photos.length < MIN_LISTING_IMAGES
              ? 'font-medium text-secondary'
              : 'text-neutral-muted'
          }`}
        >
          {listingImageProgressMessage(photos.length)}
          {status === 'published' ? ' — ready to publish' : ''}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-surface-alt"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent-deep/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-light bg-surface-alt text-neutral-muted transition-colors hover:border-primary hover:text-ink">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px] font-semibold">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Or paste image URL"
            className="min-w-0 flex-1 rounded-xl border border-neutral-light bg-surface-alt px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addUrlPhoto}
            className="shrink-0 rounded-full border border-neutral-light px-4 py-2 text-sm font-bold text-ink hover:bg-surface-alt"
          >
            Add URL
          </button>
        </div>

        {touched && intent === 'publish' && !validation.ok ? (
          <p className="mt-2 text-sm font-medium text-secondary" role="alert">
            {validation.message}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ArrowPillButton
          type="submit"
          disabled={submitting}
          onClick={() => setIntent('publish')}
          size="lg"
        >
          {submitting && intent === 'publish' ? 'Publishing…' : 'Publish listing'}
        </ArrowPillButton>
        <button
          type="submit"
          disabled={submitting}
          onClick={() => setIntent('draft')}
          className="rounded-full border border-neutral-light px-6 py-3 text-sm font-bold text-ink hover:bg-surface-alt disabled:opacity-60"
        >
          {submitting && intent === 'draft' ? 'Saving…' : 'Save as draft'}
        </button>
      </div>
    </form>
  )
}
