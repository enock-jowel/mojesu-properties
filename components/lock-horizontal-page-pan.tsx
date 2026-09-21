'use client'

import { useEffect } from 'react'

/**
 * Blocks sideways page pan / edge bounce on iOS Safari when CSS touch-action
 * alone isn’t enough. Horizontal gestures still work inside carousels.
 */
export function LockHorizontalPagePan() {
  useEffect(() => {
    let startX = 0
    let startY = 0
    /** null = undecided, true = block horizontal page pan, false = allow */
    let blockHorizontal: boolean | null = null

    const isAllowedXScroller = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return Boolean(target.closest('.carousel-track, .allow-x-scroll'))
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      blockHorizontal = null
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      if (isAllowedXScroller(e.target)) return

      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY

      if (blockHorizontal === null) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
        blockHorizontal = Math.abs(dx) > Math.abs(dy)
      }

      if (blockHorizontal) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return null
}
