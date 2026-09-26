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
import subsetFont from 'subset-font'

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

async function main() {
  const used = harvestIcons()
  const parts: string[] = [
    '/* Auto-generated — pnpm uicons:subset */',
    '.fi{display:inline-flex;align-items:center;justify-content:center}',
  ]
  const missing: string[] = []
  const fontDir = join(root, 'styles/fonts')
  mkdirSync(fontDir, { recursive: true })
  let fontBytes = 0

  for (const [key, src] of Object.entries(SOURCES)) {
    const css = readFileSync(join(root, src.css), 'utf8')
    const needed = [...used].filter((u) => u.startsWith(src.prefix)).sort()
    if (needed.length === 0) continue

    const fontFace = css.match(/@font-face\{[^}]+\}/)?.[0]
    const family = css.match(src.familyRe)?.[0]
    const woff2 = fontFace?.match(/url\(\.\.\/(uicons-[^)]+\.woff2)\)/)?.[1]
    const familyName = fontFace?.match(/font-family:([^;]+);/)?.[1]
    if (!fontFace || !family || !woff2 || !familyName) {
      throw new Error(`Could not parse ${src.css}`)
    }

    const rules: string[] = []
    const glyphs: string[] = []
    for (const name of needed) {
      const rule = css.match(
        new RegExp(`\\.${name.replace(/-/g, '\\-')}:before\\{[^}]+\\}`),
      )?.[0]
      const hex = rule?.match(/content:"\\([0-9a-f]+)"/i)?.[1]
      if (!rule || !hex) {
        missing.push(name)
        continue
      }
      rules.push(rule)
      glyphs.push(String.fromCodePoint(parseInt(hex, 16)))
    }

    // Full packs are 300KB+ each; only ship the glyphs referenced in source.
    const full = readFileSync(
      join(root, 'node_modules/@flaticon/flaticon-uicons/css', woff2),
    )
    const subset = await subsetFont(full, glyphs.join(''), {
      targetFormat: 'woff2',
    })
    const fontFile = `uicons-${key}.woff2`
    writeFileSync(join(fontDir, fontFile), subset)
    fontBytes += subset.length

    parts.push(
      `/* ${key}: ${rules.length} icons */`,
      `@font-face{font-family:${familyName};src:url(./fonts/${fontFile}) format("woff2");font-display:swap}`,
      family,
      ...rules,
    )
  }

  const outPath = join(root, 'styles/uicons-subset.css')
  mkdirSync(dirname(outPath), { recursive: true })
  const body = `${parts.join('\n')}\n`
  writeFileSync(outPath, body)
  console.log(
    `uicons subset: ${used.size} icons from source → ${relative(root, outPath)} (${body.length} bytes CSS, ${fontBytes} bytes fonts)`,
  )
  if (missing.length) {
    console.warn('Missing glyph CSS (skipped):', missing.join(', '))
  }
}

void main()
