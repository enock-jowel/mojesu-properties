/**
 * Seed hosted preview DB from .env.preview.local (never touches local Docker).
 *
 * Prerequisites: run scripts/bootstrap-remote.sql in the Supabase SQL editor.
 * Usage: pnpm preview:seed
 */
import { config } from 'dotenv'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = path.resolve(__dirname, '..')
const previewEnv = path.join(root, '.env.preview.local')

config({ path: previewEnv, override: true })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
  console.error('Refusing to seed: NEXT_PUBLIC_SUPABASE_URL is not a hosted Supabase project.')
  console.error('Expected .env.preview.local to point at *.supabase.co')
  process.exit(1)
}

if (process.env.NEXT_PUBLIC_SUPABASE_URL.includes('127.0.0.1')) {
  console.error('Refusing to seed local Docker from preview:seed')
  process.exit(1)
}

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

const tsx = path.join(root, 'node_modules/tsx/dist/cli.mjs')
const steps = [
  'scripts/seed-listings.ts',
  'scripts/seed-content.ts',
  'scripts/seed-site-content.ts',
]

console.log('Seeding hosted preview:', new URL(env.NEXT_PUBLIC_SUPABASE_URL!).host)

for (const script of steps) {
  console.log('\n→', script)
  const r = spawnSync(process.execPath, [tsx, path.join(root, script)], {
    cwd: root,
    env,
    stdio: 'inherit',
  })
  if (r.status !== 0) {
    console.error(`Failed: ${script}`)
    process.exit(r.status || 1)
  }
}

console.log('\nPreview seed complete.')
