'use client'

import { useEffect, useId, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string
          action?: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type Props = {
  action: string
  onToken: (token: string | null) => void
  className?: string
}

/**
 * Renders Cloudflare Turnstile when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 * Otherwise renders nothing (server skips verify when TURNSTILE_SECRET unset).
 */
export function TurnstileField({ action, onToken, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken
  const reactId = useId()

  useEffect(() => {
    if (!SITE_KEY || !hostRef.current) return

    let cancelled = false

    function mount() {
      if (cancelled || !hostRef.current || !window.turnstile) return
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
      widgetIdRef.current = window.turnstile.render(hostRef.current, {
        sitekey: SITE_KEY,
        action,
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => onTokenRef.current(null),
        theme: 'light',
      })
    }

    const existing = document.querySelector(
      'script[data-mojesu-turnstile="1"]',
    ) as HTMLScriptElement | null

    if (window.turnstile) {
      mount()
    } else if (existing) {
      const prev = window.onTurnstileLoad
      window.onTurnstileLoad = () => {
        prev?.()
        mount()
      }
    } else {
      window.onTurnstileLoad = mount
      const script = document.createElement('script')
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      script.defer = true
      script.dataset.mojesuTurnstile = '1'
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null
      }
    }
  }, [action, reactId])

  if (!SITE_KEY) return null

  return (
    <div
      className={className}
      ref={hostRef}
      data-turnstile-action={action}
    />
  )
}

export function isTurnstileEnabled(): boolean {
  return Boolean(SITE_KEY)
}
