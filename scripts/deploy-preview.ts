/**
 * Build + deploy Cloudflare Workers preview using .env.preview.local.
 * Does not modify .env.local.
 *
 * Usage: node ./node_modules/tsx/dist/cli.mjs scripts/deploy-preview.ts
 */
import { config } from 'dotenv'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = path.resolve(__dirname, '..')
config({ path: path.join(root, '.env.preview.local'), override: true })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
if (!url.includes('supabase.co')) {
  console.error('Refusing deploy: .env.preview.local must point at hosted Supabase.')
  process.exit(1)
}

// Public URL — workers.dev hostname matches wrangler.jsonc "name"
const site =
  process.env.NEXT_PUBLIC_SITE_URL &&
  !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://mojesu-preview.learnandlunch.workers.dev'

const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: site,
  SITE_URL: site,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
}

function run(cmd: string, args: string[]) {
  console.log('\n→', cmd, args.join(' '))
  const r = spawnSync(cmd, args, { cwd: root, env, stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status || 1)
}

console.log('Preview deploy')
console.log('  Supabase:', new URL(url).host)
console.log('  Site URL:', site)

run(process.execPath, [
  path.join(root, 'node_modules/next/dist/bin/next'),
  'build',
])

run(process.execPath, [
  path.join(root, 'node_modules/@opennextjs/cloudflare/dist/cli/index.js'),
  'build',
  '--skipNextBuild',
])

// Non-secret vars for the Worker runtime
run(path.join(root, 'node_modules/.bin/wrangler'), [
  'deploy',
  '--var',
  `NEXT_PUBLIC_SITE_URL:${site}`,
  '--var',
  `SITE_URL:${site}`,
  '--var',
  `NEXT_PUBLIC_SUPABASE_URL:${env.NEXT_PUBLIC_SUPABASE_URL}`,
  '--var',
  `NEXT_PUBLIC_SUPABASE_ANON_KEY:${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
])

console.log('\nDeploy finished. Set service role secret if admin actions need it:')
console.log('  echo "$SUPABASE_SERVICE_ROLE_KEY" | pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY')
