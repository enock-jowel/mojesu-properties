/**
 * Kampala-area location catalog with market tiers.
 * Used by HeroSearch autocomplete and future "similar areas" fallback.
 */

export type AreaTier = 'prime' | 'mid' | 'emerging'

export interface AreaOption {
  name: string
  tier: AreaTier
}

export const AREA_TIER_LABEL: Record<AreaTier, string> = {
  prime: 'Prime',
  mid: 'Mid-market',
  emerging: 'Emerging',
}

export const AREA_CATALOG: AreaOption[] = [
  // Prime
  { name: 'Kololo', tier: 'prime' },
  { name: 'Nakasero', tier: 'prime' },
  { name: 'Naguru', tier: 'prime' },
  { name: 'Muyenga', tier: 'prime' },
  { name: 'Munyonyo', tier: 'prime' },
  { name: 'Lubowa', tier: 'prime' },
  // Mid-market
  { name: 'Ntinda', tier: 'mid' },
  { name: 'Bukoto', tier: 'mid' },
  { name: 'Kisaasi', tier: 'mid' },
  { name: 'Kira', tier: 'mid' },
  { name: 'Najjera', tier: 'mid' },
  { name: 'Naalya', tier: 'mid' },
  { name: 'Bugolobi', tier: 'mid' },
  { name: 'Namugongo', tier: 'mid' },
  // Emerging
  { name: 'Outer Kira', tier: 'emerging' },
  { name: 'Wakiso', tier: 'emerging' },
  { name: 'Mukono', tier: 'emerging' },
  { name: 'Gayaza', tier: 'emerging' },
  { name: 'Kikoni', tier: 'emerging' },
]

export function getAreaTier(name: string): AreaTier | undefined {
  return AREA_CATALOG.find(
    (a) => a.name.toLowerCase() === name.toLowerCase(),
  )?.tier
}

export function areasGroupedByTier(): Record<AreaTier, AreaOption[]> {
  return {
    prime: AREA_CATALOG.filter((a) => a.tier === 'prime'),
    mid: AREA_CATALOG.filter((a) => a.tier === 'mid'),
    emerging: AREA_CATALOG.filter((a) => a.tier === 'emerging'),
  }
}
