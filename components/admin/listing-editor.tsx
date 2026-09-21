'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import {
  ArrowLeft,
  Building2,
  Home,
  ImagePlus,
  KeyRound,
  LandPlot,
  Star,
  Trash2,
} from 'lucide-react'
import { AreaAutocomplete } from '@/components/area-autocomplete'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { PropertyDetailPage } from '@/components/property-detail-page'
import { amenityOptionsForCategory } from '@/lib/listings/amenities-options'
import { useTaxonomy } from '@/components/site-catalog-provider'
import { saveListing } from '@/lib/listings/actions'
import {
  CATEGORY_LABEL,
  HIGHLIGHT_SUGGESTIONS,
  ROOM_TAGS,
  areaTierToCms,
  listingRowToProperty,
  slugifyTitle,
} from '@/lib/listings/map'
import type {
  CmsCategory,
  CmsListingMode,
  CmsStatus,
  CmsTitleStatus,
  ListingImageInput,
  ListingRow,
  ListingWriteInput,
} from '@/lib/listings/types'
import { MIN_LISTING_IMAGES, validateListingImages } from '@/lib/listing-validation'
import { createClient } from '@/lib/supabase/client'
import type { AreaTier } from '@/lib/areas'

type Step = 'type' | 'details' | 'photos' | 'amenities' | 'pricing' | 'review'

const STEPS: Step[] = [
  'type',
  'details',
  'photos',
  'amenities',
  'pricing',
  'review',
]

const STEP_TITLE: Record<Step, string> = {
  type: 'Type & location',
  details: 'Details',
  photos: 'Photos',
  amenities: 'Amenities',
  pricing: 'Pricing & description',
  review: 'Review & publish',
}

const fieldClass =
  'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'

const UTILITIES = ['Water (NWSC)', 'Electricity', 'Garbage', 'Security', 'Internet']

type DraftImage = ListingImageInput & { localId: string; preview?: string }

export type ListingEditorPrefill = Partial<ListingWriteInput>

function emptyDraft(
  initial?: ListingRow,
  prefill?: ListingEditorPrefill,
): {
  form: Omit<ListingWriteInput, 'images' | 'status'> & { status: CmsStatus }
  images: DraftImage[]
} {
  if (!initial) {
    const { images: prefillImages, status: _ignoreStatus, ...prefillRest } =
      prefill || {}
    const base = {
      listing_mode: 'rent' as CmsListingMode,
      category: 'apartment' as CmsCategory,
      title: '',
      description: '',
      area: '',
      area_tier: null as ListingWriteInput['area_tier'],
      address_internal: '',
      price: null as number | null,
      price_negotiable: false,
      currency: 'UGX',
      bedrooms: null as number | null,
      bathrooms: null as number | null,
      size_sqm: null as number | null,
      furnishing: '',
      year_built: null as number | null,
      condition: '',
      plot_dimensions: '',
      plot_size_total: '',
      surveyed: false,
      topography: '',
      zoning: '',
      title_status: null as CmsTitleStatus | null,
      encumbrances: 'None known',
      floor_area: null as number | null,
      unit_type: '',
      floor_count: null as number | null,
      layout: '',
      power_capacity: '',
      deposit: null as number | null,
      deposit_refundable: true,
      min_lease_term: '',
      included_utilities: [] as string[],
      pet_policy: '',
      available_from: '',
      highlights: [] as string[],
      amenities: [] as string[],
      location_notes: '',
      ...prefillRest,
      status: 'draft' as CmsStatus,
    }
    const imgs = (prefillImages || []).map((img, i) => ({
      localId: `prefill-${i}`,
      url: img.url,
      is_cover: Boolean(img.is_cover) || i === 0,
      room_tag: img.room_tag ?? null,
      sort_order: img.sort_order ?? i,
    }))
    return { form: base, images: imgs }
  }

  const imgs = [...(initial.listing_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )

  return {
    form: {
      slug: initial.slug,
      listing_mode: initial.listing_mode,
      category: initial.category,
      status: initial.status,
      title: initial.title,
      description: initial.description || '',
      area: initial.area,
      area_tier: initial.area_tier,
      address_internal: initial.address_internal || '',
      price: initial.price,
      price_negotiable: Boolean(initial.price_negotiable),
      currency: initial.currency || 'UGX',
      bedrooms: initial.bedrooms,
      bathrooms: initial.bathrooms,
      size_sqm: initial.size_sqm,
      furnishing: initial.furnishing || '',
      year_built: initial.year_built,
      condition: initial.condition || '',
      plot_dimensions: initial.plot_dimensions || '',
      plot_size_total: initial.plot_size_total || '',
      surveyed: Boolean(initial.surveyed),
      topography: initial.topography || '',
      zoning: initial.zoning || '',
      title_status: initial.title_status,
      encumbrances: initial.encumbrances || 'None known',
      floor_area: initial.floor_area,
      unit_type: initial.unit_type || '',
      floor_count: initial.floor_count,
      layout: initial.layout || '',
      power_capacity: initial.power_capacity || '',
      deposit: initial.deposit,
      deposit_refundable: initial.deposit_refundable ?? true,
      min_lease_term: initial.min_lease_term || '',
      included_utilities: initial.included_utilities || [],
      pet_policy: initial.pet_policy || '',
      available_from: initial.available_from || '',
      highlights: initial.highlights || [],
      amenities: initial.amenities || [],
      location_notes: initial.location_notes || '',
    },
    images: imgs.map((img, i) => ({
      localId: img.id || `img-${i}`,
      url: img.url,
      is_cover: Boolean(img.is_cover) || i === 0,
      room_tag: img.room_tag,
      sort_order: img.sort_order ?? i,
    })),
  }
}

async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.size < 900_000) return file
  const bitmap = await createImageBitmap(file)
  const max = 1600
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82),
  )
  return blob || file
}

export function ListingEditor({
  initial,
  prefill,
}: {
  initial?: ListingRow
  prefill?: ListingEditorPrefill
}) {
  const router = useRouter()
  const seed = useMemo(() => emptyDraft(initial, prefill), [initial, prefill])
  const [step, setStep] = useState<Step>('type')
  const [form, setForm] = useState(seed.form)
  const [images, setImages] = useState<DraftImage[]>(seed.images)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()
  const stepIndex = STEPS.indexOf(step)

  const { amenityLabels } = useTaxonomy()
  const amenityOptions = amenityOptionsForCategory(form.category, amenityLabels)
  const imageCheck = validateListingImages(images)

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function canContinue(): string | null {
    if (step === 'type') {
      if (!form.area.trim()) return 'Choose an area.'
      if (!form.title.trim()) return 'Add a working title (you can refine later).'
    }
    if (step === 'photos') {
      if (images.length < MIN_LISTING_IMAGES) {
        return imageCheck.message
      }
    }
    if (step === 'details' && form.category === 'land') {
      if (!form.title_status) return 'Title status is required for land.'
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

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const folder = initial?.id || 'draft'
    try {
      for (const file of Array.from(files)) {
        const blob = await compressImage(file)
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${folder}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('listing-images')
          .upload(path, blob, { contentType: blob.type || file.type, upsert: false })
        if (upErr) throw upErr
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        setImages((prev) => {
          const next = [
            ...prev,
            {
              localId: crypto.randomUUID(),
              url: data.publicUrl,
              is_cover: prev.length === 0,
              room_tag: null,
              sort_order: prev.length,
              preview: data.publicUrl,
            },
          ]
          return next
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((img, i) => ({ ...img, sort_order: i }))
    })
  }

  function setCover(localId: string) {
    setImages((prev) =>
      prev.map((img) => ({ ...img, is_cover: img.localId === localId })),
    )
  }

  function toggleAmenity(key: string) {
    setForm((prev) => {
      const set = new Set(prev.amenities || [])
      if (set.has(key)) set.delete(key)
      else set.add(key)
      return { ...prev, amenities: [...set] }
    })
  }

  function toggleHighlight(chip: string) {
    setForm((prev) => {
      const list = [...(prev.highlights || [])]
      const idx = list.indexOf(chip)
      if (idx >= 0) list.splice(idx, 1)
      else if (list.length < 3) list.push(chip)
      return { ...prev, highlights: list }
    })
  }

  function buildPayload(status: CmsStatus): ListingWriteInput {
    return {
      ...form,
      status,
      slug: form.slug || slugifyTitle(form.title),
      images: images.map((img, i) => ({
        url: img.url,
        is_cover: Boolean(img.is_cover) || i === 0,
        room_tag: img.room_tag,
        sort_order: i,
      })),
    }
  }

  function publishBlockers(): string | null {
    if (images.length < MIN_LISTING_IMAGES) return imageCheck.message
    if (!images.some((i) => i.is_cover)) return 'Select a cover photo.'
    if (form.listing_mode === 'sale' && !form.title_status) {
      return 'Title status is required for sale listings.'
    }
    if (form.category === 'land' && !form.title_status) {
      return 'Title status is required for land.'
    }
    if (!form.title.trim() || !form.area.trim()) return 'Title and area are required.'
    return null
  }

  function onSave(status: CmsStatus) {
    setError(null)
    if (status === 'published') {
      const block = publishBlockers()
      if (block) {
        setError(block)
        return
      }
    }
    startTransition(async () => {
      const result = await saveListing(buildPayload(status), initial?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/admin/listings/')
      router.refresh()
    })
  }

  const previewProperty = useMemo(() => {
    const payload = buildPayload('draft')
    const fakeRow: ListingRow = {
      id: initial?.id || 'preview',
      slug: payload.slug || 'preview',
      listing_mode: payload.listing_mode,
      category: payload.category,
      status: 'draft',
      title: payload.title || 'Untitled listing',
      description: payload.description || '',
      area: payload.area || 'Kampala',
      area_tier: payload.area_tier ?? null,
      address_internal: payload.address_internal ?? null,
      price: payload.price ?? 0,
      price_negotiable: payload.price_negotiable ?? false,
      currency: 'UGX',
      bedrooms: payload.bedrooms ?? null,
      bathrooms: payload.bathrooms ?? null,
      size_sqm: payload.size_sqm ?? null,
      furnishing: payload.furnishing ?? null,
      year_built: payload.year_built ?? null,
      condition: payload.condition ?? null,
      plot_dimensions: payload.plot_dimensions ?? null,
      plot_size_total: payload.plot_size_total ?? null,
      surveyed: payload.surveyed ?? null,
      topography: payload.topography ?? null,
      zoning: payload.zoning ?? null,
      title_status: payload.title_status ?? null,
      encumbrances: payload.encumbrances ?? null,
      floor_area: payload.floor_area ?? null,
      unit_type: payload.unit_type ?? null,
      floor_count: payload.floor_count ?? null,
      layout: payload.layout ?? null,
      power_capacity: payload.power_capacity ?? null,
      deposit: payload.deposit ?? null,
      deposit_refundable: payload.deposit_refundable ?? null,
      min_lease_term: payload.min_lease_term ?? null,
      included_utilities: payload.included_utilities ?? null,
      pet_policy: payload.pet_policy ?? null,
      available_from: payload.available_from ?? null,
      service_charge: null,
      escalation_clause: null,
      occupancy_status: null,
      highlights: payload.highlights ?? null,
      amenities: payload.amenities ?? null,
      location_notes: payload.location_notes ?? null,
      is_featured: payload.is_featured ?? false,
      created_by: null,
      updated_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      listing_images: payload.images.map((img, i) => ({
        id: `p-${i}`,
        listing_id: 'preview',
        url: img.url,
        is_cover: Boolean(img.is_cover),
        room_tag: img.room_tag ?? null,
        sort_order: i,
      })),
    }
    return listingRowToProperty(fakeRow)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, images, initial?.id])

  const categories: {
    id: CmsCategory
    label: string
    icon: typeof Home
  }[] = [
    { id: 'house', label: 'House', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building2 },
    { id: 'land', label: 'Land', icon: LandPlot },
    { id: 'commercial', label: 'Commercial', icon: KeyRound },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-full p-2 text-neutral-muted transition-colors hover:bg-surface-alt hover:text-ink"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  i <= stepIndex ? 'bg-primary' : 'bg-neutral-light'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <h1 className="text-lg font-extrabold text-ink sm:text-xl">
              {STEP_TITLE[step]}
            </h1>
            <span className="text-xs font-semibold text-neutral-muted">
              {stepIndex + 1}/{STEPS.length}
            </span>
          </div>
        </div>
      </div>

      <div className="animate-card-in">
        {step === 'type' ? (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Listing mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['rent', 'sale'] as CmsListingMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => patch('listing_mode', m)}
                    className={`rounded-xl border px-3 py-3 text-sm font-bold capitalize ${
                      form.listing_mode === m
                        ? 'border-primary bg-pill-soft text-ink'
                        : 'border-neutral-light bg-surface-alt text-neutral-muted'
                    }`}
                  >
                    For {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Category
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {categories.map((c) => {
                  const Icon = c.icon
                  const active = form.category === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => patch('category', c.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-bold ${
                        active
                          ? 'border-primary bg-pill-soft text-ink'
                          : 'border-neutral-light bg-surface-alt text-neutral-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Title
              </label>
              <input
                className={fieldClass}
                value={form.title}
                onChange={(e) => patch('title', e.target.value)}
                placeholder="e.g. Bright 2-bed apartment in Ntinda"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Area
              </label>
              <AreaAutocomplete
                value={form.area}
                onChange={(name, tier) => {
                  patch('area', name)
                  patch('area_tier', areaTierToCms(tier as AreaTier | ''))
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Internal address (not public)
              </label>
              <input
                className={fieldClass}
                value={form.address_internal || ''}
                onChange={(e) => patch('address_internal', e.target.value)}
                placeholder="Plot / street notes for staff"
              />
            </div>
          </div>
        ) : null}

        {step === 'details' ? (
          <div className="flex flex-col gap-4">
            {(form.category === 'house' || form.category === 'apartment') && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <NumField
                    label="Bedrooms"
                    value={form.bedrooms}
                    onChange={(v) => patch('bedrooms', v)}
                  />
                  <NumField
                    label="Bathrooms"
                    value={form.bathrooms}
                    onChange={(v) => patch('bathrooms', v)}
                  />
                </div>
                <NumField
                  label="Size (sqm)"
                  value={form.size_sqm}
                  onChange={(v) => patch('size_sqm', v)}
                />
                <TextField
                  label="Furnishing"
                  value={form.furnishing || ''}
                  onChange={(v) => patch('furnishing', v)}
                  placeholder="Furnished / Semi / Unfurnished"
                />
                <NumField
                  label="Year built"
                  value={form.year_built}
                  onChange={(v) => patch('year_built', v)}
                />
                <TextField
                  label="Condition"
                  value={form.condition || ''}
                  onChange={(v) => patch('condition', v)}
                />
              </>
            )}

            {form.category === 'land' && (
              <>
                <TextField
                  label="Plot dimensions"
                  value={form.plot_dimensions || ''}
                  onChange={(v) => patch('plot_dimensions', v)}
                  placeholder="50x100 ft"
                />
                <TextField
                  label="Total size"
                  value={form.plot_size_total || ''}
                  onChange={(v) => patch('plot_size_total', v)}
                />
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(form.surveyed)}
                    onChange={(e) => patch('surveyed', e.target.checked)}
                  />
                  Surveyed / beaconed
                </label>
                <TextField
                  label="Topography"
                  value={form.topography || ''}
                  onChange={(v) => patch('topography', v)}
                />
                <TextField
                  label="Zoning"
                  value={form.zoning || ''}
                  onChange={(v) => patch('zoning', v)}
                />
                <TitleStatusSelect
                  value={form.title_status}
                  onChange={(v) => patch('title_status', v)}
                  required
                />
                <TextField
                  label="Encumbrances"
                  value={form.encumbrances || 'None known'}
                  onChange={(v) => patch('encumbrances', v || 'None known')}
                />
              </>
            )}

            {form.category === 'commercial' && (
              <>
                <NumField
                  label="Floor area (sqm)"
                  value={form.floor_area}
                  onChange={(v) => patch('floor_area', v)}
                />
                <TextField
                  label="Unit type"
                  value={form.unit_type || ''}
                  onChange={(v) => patch('unit_type', v)}
                  placeholder="Office / retail / warehouse"
                />
                <NumField
                  label="Floor count"
                  value={form.floor_count}
                  onChange={(v) => patch('floor_count', v)}
                />
                <TextField
                  label="Layout"
                  value={form.layout || ''}
                  onChange={(v) => patch('layout', v)}
                />
                <TextField
                  label="Power capacity"
                  value={form.power_capacity || ''}
                  onChange={(v) => patch('power_capacity', v)}
                />
              </>
            )}

            {form.listing_mode === 'rent' && (
              <div className="mt-2 rounded-xl border border-neutral-light/80 bg-pill-soft/30 p-3">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Rent terms
                </p>
                <div className="flex flex-col gap-3">
                  <NumField
                    label="Deposit (months)"
                    value={form.deposit}
                    onChange={(v) => patch('deposit', v)}
                  />
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <input
                      type="checkbox"
                      checked={Boolean(form.deposit_refundable)}
                      onChange={(e) =>
                        patch('deposit_refundable', e.target.checked)
                      }
                    />
                    Deposit refundable
                  </label>
                  <TextField
                    label="Min lease term"
                    value={form.min_lease_term || ''}
                    onChange={(v) => patch('min_lease_term', v)}
                    placeholder="1 year renewable"
                  />
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                      Included utilities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {UTILITIES.map((u) => {
                        const on = (form.included_utilities || []).includes(u)
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              const set = new Set(form.included_utilities || [])
                              if (on) set.delete(u)
                              else set.add(u)
                              patch('included_utilities', [...set])
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              on
                                ? 'bg-primary text-white'
                                : 'bg-surface-alt text-neutral-muted'
                            }`}
                          >
                            {u}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <TextField
                    label="Pet policy"
                    value={form.pet_policy || ''}
                    onChange={(v) => patch('pet_policy', v)}
                  />
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                      Available from
                    </label>
                    <input
                      type="date"
                      className={fieldClass}
                      value={form.available_from || ''}
                      onChange={(e) => patch('available_from', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {form.listing_mode === 'sale' && form.category !== 'land' && (
              <TitleStatusSelect
                value={form.title_status}
                onChange={(v) => patch('title_status', v)}
                required
              />
            )}
          </div>
        ) : null}

        {step === 'photos' ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-neutral-muted">
              {images.length} of {MIN_LISTING_IMAGES} minimum photos added
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-light bg-surface-alt/50 px-4 py-8 text-sm font-semibold text-neutral-muted transition-colors hover:border-primary hover:text-ink">
              <ImagePlus className="h-6 w-6 text-primary" />
              {uploading ? 'Uploading…' : 'Add photos'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => void onPickFiles(e.target.files)}
              />
            </label>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, i) => (
                <li
                  key={img.localId}
                  className="relative overflow-hidden rounded-xl border border-neutral-light bg-surface-alt"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img.preview || img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1 p-2">
                    <button
                      type="button"
                      onClick={() => setCover(img.localId)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        img.is_cover
                          ? 'bg-primary text-white'
                          : 'bg-pill-soft text-secondary'
                      }`}
                    >
                      <Star className="h-3 w-3" />
                      Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, -1)}
                      className="rounded px-1.5 text-[10px] font-bold text-neutral-muted"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 1)}
                      className="rounded px-1.5 text-[10px] font-bold text-neutral-muted"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) =>
                          prev.filter((x) => x.localId !== img.localId),
                        )
                      }
                      className="ml-auto text-neutral-muted"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <select
                    className="mx-2 mb-2 w-[calc(100%-1rem)] rounded border border-neutral-light bg-background px-2 py-1 text-[11px]"
                    value={img.room_tag || ''}
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((x) =>
                          x.localId === img.localId
                            ? { ...x, room_tag: e.target.value || null }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="">Room tag</option>
                    {ROOM_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 'amenities' ? (
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((opt) => {
              const on = (form.amenities || []).includes(opt.key)
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleAmenity(opt.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    on
                      ? 'bg-primary text-white'
                      : 'bg-surface-alt text-neutral-muted'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        ) : null}

        {step === 'pricing' ? (
          <div className="flex flex-col gap-4">
            <NumField
              label={form.listing_mode === 'rent' ? 'Monthly rent (UGX)' : 'Price (UGX)'}
              value={form.price}
              onChange={(v) => patch('price', v)}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={Boolean(form.price_negotiable)}
                onChange={(e) => patch('price_negotiable', e.target.checked)}
              />
              Price negotiable
            </label>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Highlights (up to 3)
              </p>
              <div className="mb-2 flex flex-wrap gap-2">
                {HIGHLIGHT_SUGGESTIONS.map((chip) => {
                  const on = (form.highlights || []).includes(chip)
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleHighlight(chip)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        on
                          ? 'bg-primary text-white'
                          : 'bg-pill-soft text-secondary'
                      }`}
                    >
                      {chip}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Description
              </label>
              <textarea
                className={`${fieldClass} min-h-[120px]`}
                value={form.description || ''}
                onChange={(e) => patch('description', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
                Location notes
              </label>
              <textarea
                className={`${fieldClass} min-h-[80px]`}
                value={form.location_notes || ''}
                onChange={(e) => patch('location_notes', e.target.value)}
                placeholder="Neighbourhood context for the public page"
              />
            </div>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-neutral-muted">
              Preview uses the live property detail layout — what visitors will see
              after publish.
            </p>
            <div className="overflow-hidden rounded-2xl border border-neutral-light">
              <div className="max-h-[70vh] overflow-y-auto bg-background">
                <PropertyDetailPage item={previewProperty} similar={[]} />
              </div>
            </div>
            {publishBlockers() ? (
              <p className="text-sm font-semibold text-secondary">
                {publishBlockers()}
              </p>
            ) : (
              <p className="text-sm font-semibold text-accent-deep">
                Ready to publish · {CATEGORY_LABEL[form.category]} · {form.area}
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
            disabled={uploading || pending}
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
      </div>
    </div>
  )
}

function TextField({
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
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
        {label}
      </label>
      <input
        className={fieldClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null | undefined
  onChange: (v: number | null) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
        {label}
      </label>
      <input
        type="number"
        className={fieldClass}
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      />
    </div>
  )
}

function TitleStatusSelect({
  value,
  onChange,
  required,
}: {
  value: CmsTitleStatus | null | undefined
  onChange: (v: CmsTitleStatus | null) => void
  required?: boolean
}) {
  const { titleStatus } = useTaxonomy()
  const options = ['freehold', 'leasehold', 'mailo', 'customary'] as const
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted">
        Title status{required ? ' *' : ''}
      </label>
      <select
        className={fieldClass}
        value={value || ''}
        onChange={(e) =>
          onChange((e.target.value || null) as CmsTitleStatus | null)
        }
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {titleStatus[o] || o}
          </option>
        ))}
      </select>
    </div>
  )
}
