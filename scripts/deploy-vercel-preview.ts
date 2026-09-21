/**
 * Deploy Mojesu preview to Vercel using .env.preview.local (hosted Supabase).
 * Does not modify .env.local Supabase settings.
 *
 * Usage: pnpm vercel:preview
 */
import { config } from 'dotenv'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '..')
config({ path: path.join(root, '.env.preview.local'), override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
if (!supabaseUrl.includes('supabase.co')) {
  console.error('Refusing deploy: .env.preview.local must point at hosted Supabase.')
  process.exit(1)
}

for (const key of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env.preview.local`)
    process.exit(1)
  }
}

const vercelBin = path.join(root, 'node_modules/.bin/vercel')
if (!fs.existsSync(vercelBin)) {
  console.error('vercel CLI not installed. Run: pnpm add -D vercel -w')
  process.exit(1)
}

function run(args: string[], opts: { inherit?: boolean } = {}) {
  console.log('\n→ vercel', args.join(' '))
  const r = spawnSync(vercelBin, args, {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: opts.inherit === false ? 'pipe' : 'inherit',
  })
  if (r.status !== 0) {
    if (opts.inherit === false) {
      process.stdout.write(r.stdout || '')
      process.stderr.write(r.stderr || '')
    }
    process.exit(r.status || 1)
  }
  return r
}

function runCapture(args: string[]) {
  console.log('\n→ vercel', args.join(' '))
  return spawnSync(vercelBin, args, {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
  })
}

function ensureLinked() {
  if (fs.existsSync(path.join(root, '.vercel', 'project.json'))) return
  run(['link', '--yes', '--project', 'mojesu-preview'])
}

function setEnv(key: string, value: string) {
  // Only treat true secrets as sensitive — SITE_URL / notify addresses are fine as plain.
  const sensitive =
    key.includes('SERVICE_ROLE') ||
    key.includes('SECRET') ||
    key === 'RESEND_API_KEY' ||
    key === 'BITLY_ACCESS_TOKEN' ||
    key === 'GOOGLE_PLACES_API_KEY'
  const r = runCapture([
    'env',
    'add',
    key,
    'production,preview,development',
    '--value',
    value,
    '--force',
    '--yes',
    '--non-interactive',
    ...(sensitive ? ['--sensitive'] : ['--no-sensitive']),
  ])
  if (r.status !== 0) {
    console.error(`Failed setting ${key}`)
    process.stderr.write(r.stderr || r.stdout || '')
    // Retry once without sensitive flag (some accounts reject --sensitive)
    const retry = runCapture([
      'env',
      'add',
      key,
      'production,preview,development',
      '--value',
      value,
      '--force',
      '--yes',
      '--non-interactive',
      '--no-sensitive',
    ])
    if (retry.status !== 0) {
      process.stderr.write(retry.stderr || retry.stdout || '')
      process.exit(retry.status || 1)
    }
  }
  console.log(`  ✓ ${key}`)
}

function parseProdUrl(text: string) {
  const urls = [...text.matchAll(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi)].map(
    (m) => m[0].replace(/\/$/, ''),
  )
  return (
    urls.find((u) => u === 'https://mojesu-preview.vercel.app') ||
    urls.find((u) => u.includes('mojesu-preview') && !u.includes('-git-')) ||
    urls[urls.length - 1] ||
    null
  )
}

function persistSiteUrl(site: string) {
  const envPath = path.join(root, '.env.preview.local')
  let text = fs.readFileSync(envPath, 'utf8')
  if (/^NEXT_PUBLIC_SITE_URL=/m.test(text)) {
    text = text.replace(/^NEXT_PUBLIC_SITE_URL=.*$/m, `NEXT_PUBLIC_SITE_URL=${site}`)
  } else {
    text += `\nNEXT_PUBLIC_SITE_URL=${site}\n`
  }
  if (/^SITE_URL=/m.test(text)) {
    text = text.replace(/^SITE_URL=.*$/m, `SITE_URL=${site}`)
  } else {
    text += `SITE_URL=${site}\n`
  }
  fs.writeFileSync(envPath, text)
}

console.log('Vercel preview deploy')
console.log('  Supabase:', new URL(supabaseUrl).host)

ensureLinked()

/** Prefer a custom production domain when set; never clobber it with *.vercel.app. */
const CUSTOM_SITE = 'https://mojesuproperties.com'

let site = (process.env.NEXT_PUBLIC_SITE_URL || '')
  .replace(/\/$/, '')
  .replace(/\/$/, '')
if (
  !site ||
  site.includes('localhost') ||
  site.includes('workers.dev')
) {
  site = CUSTOM_SITE
}
console.log('  Site URL (initial):', site)

const envPairs: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: site,
  SITE_URL: site,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  NEXT_PUBLIC_WHATSAPP_NUMBER:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '256780827159',
  NOTIFY_EMAIL_TO:
    process.env.NOTIFY_EMAIL_TO || 'hello@mojesuproperties.com',
  NOTIFY_EMAIL_FROM:
    process.env.NOTIFY_EMAIL_FROM ||
    'Mojesu <hello@mojesuproperties.com>',
}
if (process.env.RESEND_API_KEY) envPairs.RESEND_API_KEY = process.env.RESEND_API_KEY
if (process.env.BITLY_ACCESS_TOKEN) {
  envPairs.BITLY_ACCESS_TOKEN = process.env.BITLY_ACCESS_TOKEN
}
if (process.env.GOOGLE_PLACES_API_KEY) {
  envPairs.GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
}
if (process.env.GOOGLE_PLACE_ID) {
  envPairs.GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID
}
if (process.env.GOOGLE_BUSINESS_MAPS_URL) {
  envPairs.GOOGLE_BUSINESS_MAPS_URL = process.env.GOOGLE_BUSINESS_MAPS_URL
}

console.log('\nSyncing project env…')
for (const [k, v] of Object.entries(envPairs)) setEnv(k, v)

// Avoid Vercel CLI rewriting local .env.local during deploy
const deployEnv = {
  ...process.env,
  VERCEL_ENV: undefined,
}

console.log('\nDeploying production…')
let deploy = spawnSync(vercelBin, ['deploy', '--prod', '--yes'], {
  cwd: root,
  env: deployEnv,
  encoding: 'utf8',
})
process.stdout.write(deploy.stdout || '')
process.stderr.write(deploy.stderr || '')
if (deploy.status !== 0) {
  console.log('\nRetrying deploy once…')
  deploy = spawnSync(vercelBin, ['deploy', '--prod', '--yes'], {
    cwd: root,
    env: deployEnv,
    encoding: 'utf8',
  })
  process.stdout.write(deploy.stdout || '')
  process.stderr.write(deploy.stderr || '')
  if (deploy.status !== 0) process.exit(deploy.status || 1)
}

const prodUrl = parseProdUrl(`${deploy.stdout || ''}\n${deploy.stderr || ''}`)
if (!prodUrl) {
  console.error('Deploy finished but no vercel.app URL found in output.')
  process.exit(1)
}

console.log('\nDeployment URL:', prodUrl)

// Keep custom domain as canonical; do not overwrite with the ephemeral vercel.app URL.
persistSiteUrl(site)
setEnv('NEXT_PUBLIC_SITE_URL', site)
setEnv('SITE_URL', site)

console.log('\n✅ Live:', site)
console.log('   Alias:', prodUrl)
console.log('Admin:', `${site}/admin/login/`)
console.log(
  'Add this host in Supabase → Authentication → URL configuration (Site URL + Redirect URLs).',
)
