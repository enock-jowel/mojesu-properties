import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'listing-images'
const PREFIX = 'lead-enquiries'

/**
 * Persist a lead JSON file when dedicated tables are not migrated yet.
 * Uses existing Storage bucket (service role). No UI change.
 */
export async function persistLeadFallback(
  supabase: SupabaseClient,
  kind: 'contact' | 'service',
  id: string,
  payload: unknown,
): Promise<void> {
  const path = `${PREFIX}/${kind}/${id}.json`
  const body = JSON.stringify(
    { kind, id, savedAt: new Date().toISOString(), payload },
    null,
    2,
  )
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Blob([body], { type: 'application/json' }), {
      contentType: 'application/json',
      upsert: true,
    })
  if (error) throw new Error(error.message)
}

export function isMissingRelationError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /relation .* does not exist|Could not find the table|schema cache/i.test(
    msg,
  )
}
