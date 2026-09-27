import Link from 'next/link'
import type { ReactNode } from 'react'

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

/** Only site-relative paths and https URLs become links; anything else stays text. */
function safeHref(href: string): string | null {
  if (href.startsWith('/') && !href.startsWith('//')) return href
  if (href.startsWith('https://')) return href
  return null
}

const linkClass =
  'font-semibold text-primary-dark underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary'

/**
 * Renders CMS text with `[label](/path/)` links — how insight articles link
 * to listings, browse filters and services. Text without links is unchanged.
 */
export function InlineLinks({ text }: { text: string }): ReactNode {
  if (!text.includes('](')) return text
  const out: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(LINK_RE)) {
    const [whole, label, rawHref] = m
    const start = m.index ?? 0
    const href = safeHref(rawHref)
    if (start > last) out.push(text.slice(last, start))
    if (!href) {
      out.push(whole)
    } else if (href.startsWith('/')) {
      out.push(
        <Link key={start} href={href} className={linkClass}>
          {label}
        </Link>,
      )
    } else {
      out.push(
        <a key={start} href={href} className={linkClass} rel="noopener">
          {label}
        </a>,
      )
    }
    last = start + whole.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** Plain text for JSON-LD / meta: `[label](href)` → `label`. */
export function stripInlineLinks(text: string): string {
  return text.replace(LINK_RE, '$1')
}
