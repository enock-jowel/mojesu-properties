'use client'

import { createContext, useContext } from 'react'

/**
 * False while a below-the-fold section is far from the viewport, so its
 * cards skip rendering photos (native lazy loading starts ~2500px early on
 * slow connections). Defaults to true: sections without a provider are unchanged.
 */
export const ImagesVisibleContext = createContext(true)

export function useImagesVisible(): boolean {
  return useContext(ImagesVisibleContext)
}
