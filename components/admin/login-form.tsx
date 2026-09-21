'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowPillButton } from '@/components/arrow-pill-button'

const fieldClass =
  'w-full rounded-lg border border-neutral-light bg-surface-alt px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'

export function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/admin/listings/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signError) {
        setError(signError.message)
        return
      }
      router.replace(next.startsWith('/admin') ? next : '/admin/listings/')
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="admin-email"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldClass} text-center`}
          placeholder="you@mojesuproperties.com"
        />
      </div>
      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-muted"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${fieldClass} text-center`}
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p className="text-center text-[11px] font-medium text-secondary" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-2 flex justify-center">
        <ArrowPillButton type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </ArrowPillButton>
      </div>
    </form>
  )
}
