/**
 * Featured agents — public getters read published rows from Supabase only.
 * Seed catalog: scripts/seed-data/agents-catalog.ts
 */

import { fetchPublishedAgents } from '@/lib/content/queries'

export interface Agent {
  id: string
  name: string
  role: string
  photoUrl: string
  /** Optional profile / contact anchors */
  profileHref?: string
  instagramUrl?: string
  linkedinUrl?: string
  phone?: string
}

export async function getAgents(): Promise<Agent[]> {
  const fromDb = await fetchPublishedAgents()
  return fromDb ?? []
}

export async function getFeaturedAgents(limit?: number): Promise<Agent[]> {
  const all = await getAgents()
  if (limit == null) return all
  return all.slice(0, limit)
}
