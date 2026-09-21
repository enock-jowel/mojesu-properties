'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'mojesu:favorites'

function readStored(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

function writeStored(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    /* quota / private mode */
  }
}

/**
 * Persist favorite listing ids in localStorage. Same Set API as before —
 * drop-in for existing heart toggles (no UI change).
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setFavorites(readStored())
  }, [])

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeStored(next)
      return next
    })
  }, [])

  return { favorites, toggleFav, setFavorites }
}
