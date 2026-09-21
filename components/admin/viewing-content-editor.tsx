'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import { formatViewingPassFrom } from '@/lib/site-content/catalog-helpers'
import type { ViewingContent } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

export function ViewingContentEditor({
  initial,
}: {
  initial: ViewingContent
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    const feeUgx = Number(data.feeUgx)
    const passProperties = Number(data.passProperties)
    const passDays = Number(data.passDays)
    if (!Number.isFinite(feeUgx) || feeUgx < 0) {
      setError('Fee must be a valid number')
      return
    }
    if (!Number.isFinite(passProperties) || passProperties < 1) {
      setError('Pass properties must be at least 1')
      return
    }
    if (!Number.isFinite(passDays) || passDays < 1) {
      setError('Pass days must be at least 1')
      return
    }
    startTransition(async () => {
      const result = await saveSiteContent('viewing', {
        ...data,
        feeUgx,
        passProperties,
        passDays,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Viewing fees saved')
      router.refresh()
    })
  }

  const preview = formatViewingPassFrom({
    ...data,
    feeUgx: Number(data.feeUgx) || 0,
    passProperties: Number(data.passProperties) || 0,
    passDays: Number(data.passDays) || 0,
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Viewing fees</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          Pass price and validity shown on listing booking cards and emails.
        </p>
      </div>

      <SiteCard title="Pass settings">
        <TextField
          label="Fee (UGX)"
          type="text"
          value={String(data.feeUgx)}
          onChange={(v) =>
            setData({ ...data, feeUgx: Number(v.replace(/,/g, '')) || 0 })
          }
        />
        <TextField
          label="Properties covered"
          type="text"
          value={String(data.passProperties)}
          onChange={(v) =>
            setData({
              ...data,
              passProperties: Number(v.replace(/,/g, '')) || 0,
            })
          }
        />
        <TextField
          label="Valid for (days)"
          type="text"
          value={String(data.passDays)}
          onChange={(v) =>
            setData({ ...data, passDays: Number(v.replace(/,/g, '')) || 0 })
          }
        />
        <TextField
          label="Payment note"
          value={data.paymentNote}
          onChange={(v) => setData({ ...data, paymentNote: v })}
        />
        <TextField
          label="Confirmation title"
          value={data.confirmTitle}
          onChange={(v) => setData({ ...data, confirmTitle: v })}
        />
        <TextField
          label="Confirmation subtitle"
          value={data.confirmSubtitle}
          onChange={(v) => setData({ ...data, confirmSubtitle: v })}
        />
        <p className="rounded-xl bg-pill-soft px-3 py-2 text-sm text-ink">
          Preview: {preview}. {data.paymentNote}
        </p>
      </SiteCard>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ArrowPillButton onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save viewing fees'}
      </ArrowPillButton>
    </div>
  )
}
