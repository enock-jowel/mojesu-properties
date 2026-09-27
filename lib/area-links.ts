/**
 * Client-safe lookup of which areas have a guide page. Kept separate from
 * `lib/area-guides.ts` so the guide copy never ships in client bundles —
 * keep this list in sync with AREA_GUIDES slugs.
 */
const GUIDE_SLUGS = new Set([
  'kololo',
  'nakasero',
  'naguru',
  'muyenga',
  'munyonyo',
  'lubowa',
  'ntinda',
  'bukoto',
  'kisaasi',
  'kira',
  'najjera',
  'naalya',
  'bugolobi',
  'namugongo',
  'outer-kira',
  'wakiso',
  'mukono',
  'gayaza',
  'kikoni',
])

export function areaSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** `/areas/kira/` when a guide exists for this area name, otherwise null. */
export function areaGuideHref(name: string): string | null {
  const slug = areaSlug(name)
  return GUIDE_SLUGS.has(slug) ? `/areas/${slug}/` : null
}
