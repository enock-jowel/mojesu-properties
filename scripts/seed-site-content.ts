/**
 * Upsert default site marketing content into site_content.
 * Usage: pnpm seed:site
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { SITE_CONTENT_DEFAULTS } from '../lib/site-content/defaults'
import type { SiteContentKey } from '../lib/site-content/types'

config({ path: '.env.local' })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const keys = Object.keys(SITE_CONTENT_DEFAULTS) as SiteContentKey[]
  for (const k of keys) {
    const { error } = await supabase.from('site_content').upsert(
      {
        key: k,
        data: SITE_CONTENT_DEFAULTS[k],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )
    if (error) {
      console.error(`Failed ${k}:`, error.message)
      process.exit(1)
    }
    console.log(`Upserted site_content.${k}`)
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
