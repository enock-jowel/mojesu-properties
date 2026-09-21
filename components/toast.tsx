'use client'

import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

export function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      setMessage(detail)
      setVisible(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setVisible(false), 3600)
    }
    window.addEventListener('app-toast', onToast)
    return () => window.removeEventListener('app-toast', onToast)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-7 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-accent-deep px-6 py-3.5 text-sm font-semibold text-white shadow-2xl transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-5 opacity-0'
      }`}
    >
      <Check className="h-4 w-4 text-primary" />
      {message}
    </div>
  )
}
