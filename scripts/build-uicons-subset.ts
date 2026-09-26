/**
 * Build a tiny Flaticon CSS subset from icons referenced in source.
 * Full uicons CSS is ~400KB and dominates mobile render-blocking time.
 *
 * Usage: pnpm uicons:subset
 */
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICON_RE = /\bfi-(sr|rr|brands)-([a-z0-9-]+)\b/g
const SKIP = new Set(['node_modules', '.next', 'dist', '.git', 'styles'])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full, out)
      continue
    }
    if (/\.(ts|tsx|js|jsx|sql|md|json)$/.test(name)) out.push(full)
  }
  return out
}

function harvestIcons(): Set<string> {
  const used = new Set<string>()
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(ICON_RE)) {
      used.add(`fi-${m[1]}-${m[2]}`)
    }
  }
  return used
}

const SOURCES: Record<
  string,
  { css: string; prefix: string; familyRe: RegExp }
> = {
  sr: {
    css: 'node_modules/@flaticon/flaticon-uicons/css/solid/rounded.css',
    prefix: 'fi-sr-',
    familyRe: /i\[class\^=fi-sr-\]:before.*?grayscale\}/,
  },
  rr: {
    css: 'node_modules/@flaticon/flaticon-uicons/css/regular/rounded.css',
    prefix: 'fi-rr-',
    familyRe: /i\[class\^=fi-rr-\]:before.*?grayscale\}/,
  },
  brands: {
    css: 'node_modules/@flaticon/flaticon-uicons/css/brands/all.css',
    prefix: 'fi-brands-',
    familyRe: /i\[class\^=fi-brands-\]:before.*?grayscale\}/,
  },
}

function main() {
  const used = harvestIcons()
  const parts: string[] = [
    '/* Auto-generated — pnpm uicons:subset */',
    '.fi{display:inline-flex;align-items:center;justify-content:center}',
  ]
  const missing: string[] = []

  for (const [key, src] of Object.entries(SOURCES)) {
    const css = readFileSync(join(root, src.css), 'utf8')
    const needed = [...used].filter((u) => u.startsWith(src.prefix)).sort()
    if (needed.length === 0) continue

    const fontFace = css.match(/@font-face\{[^}]+\}/)?.[0]
    const family = css.match(src.familyRe)?.[0]
    if (!fontFace || !family) {
      throw new Error(`Could not parse ${src.css}`)
    }
    const rewritten = fontFace.replace(
      /url\(\.\.\/(uicons-[^)]+)\)/g,
      'url(../node_modules/@flaticon/flaticon-uicons/css/$1)',
    )
    parts.push(`/* ${key}: ${needed.length} icons */`, rewritten, family)
    for (const name of needed) {
      const rule = css.match(
        new RegExp(`\\.${name.replace(/-/g, '\\-')}:before\\{[^}]+\\}`),
      )?.[0]
      if (!rule) {
        missing.push(name)
        continue
      }
      parts.push(rule)
    }
  }

  const outPath = join(root, 'styles/uicons-subset.css')
  mkdirSync(dirname(outPath), { recursive: true })
  const body = `${parts.join('\n')}\n`
  writeFileSync(outPath, body)
  console.log(
    `uicons subset: ${used.size} icons from source → ${relative(root, outPath)} (${body.length} bytes)`,
  )
  if (missing.length) {
    console.warn('Missing glyph CSS (skipped):', missing.join(', '))
  }
}

main()
