/**
 * Branded transactional email shell (table layout + inline styles for Gmail,
 * Outlook, Zoho). Hex values mirror the tokens in app/globals.css — email
 * clients cannot read CSS variables.
 */

export const BRAND = {
  primary: '#63aaf0',
  primaryDark: '#3492b8',
  accentDeep: '#144e6e',
  ink: '#2a2e32',
  muted: '#3d4447',
  line: '#e6e4e2',
  pillSoft: '#f1f7fb',
  pillSoftMid: '#e2f3f8',
  background: '#fafafa',
  surface: '#ffffff',
  whatsapp: '#1f8f4e',
} as const

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function siteBase(siteUrl?: string): string {
  return (siteUrl || 'https://mojesuproperties.com').replace(/\/$/, '')
}

/** Absolute, email-sized image URL (relative paths → site; Unsplash → 1200w). */
export function emailImageUrl(src: string | undefined, siteUrl?: string): string | null {
  if (!src) return null
  let url = src.trim()
  if (!url || url.startsWith('data:')) return null
  if (url.startsWith('/')) url = `${siteBase(siteUrl)}${url}`
  if (!/^https?:\/\//i.test(url)) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'images.unsplash.com') {
      u.searchParams.set('w', '1200')
      u.searchParams.set('q', '70')
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      return u.toString()
    }
    return u.toString()
  } catch {
    return null
  }
}

export function waLink(phone: string, text?: string): string | null {
  let digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('0')) digits = `256${digits.slice(1)}`
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export type DetailRow = { label: string; value: string; href?: string }

export function detailTable(rows: DetailRow[]): string {
  const body = rows
    .filter((r) => r.value?.trim())
    .map(
      (r) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.line};font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:${BRAND.muted};width:38%;vertical-align:top">${escapeHtml(r.label)}</td>
  <td style="padding:10px 0;border-bottom:1px solid ${BRAND.line};font-size:15px;font-weight:600;color:${BRAND.ink};vertical-align:top">${
        r.href
          ? `<a href="${escapeHtml(r.href)}" style="color:${BRAND.primaryDark};text-decoration:none">${escapeHtml(r.value)}</a>`
          : escapeHtml(r.value)
      }</td>
</tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>`
}

export function sectionTitle(text: string): string {
  return `<p style="margin:28px 0 10px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${BRAND.accentDeep}">${escapeHtml(text)}</p>`
}

export function button(
  label: string,
  href: string,
  variant: 'primary' | 'whatsapp' | 'outline' = 'primary',
): string {
  const bg =
    variant === 'whatsapp'
      ? BRAND.whatsapp
      : variant === 'outline'
        ? BRAND.surface
        : BRAND.accentDeep
  const color = variant === 'outline' ? BRAND.accentDeep : '#ffffff'
  const border = variant === 'outline' ? BRAND.accentDeep : bg
  return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;margin:0 8px 8px 0;border-radius:999px;background:${bg};border:1px solid ${border};color:${color};font-size:14px;font-weight:700;text-decoration:none">${escapeHtml(label)}</a>`
}

export function noteBox(html: string): string {
  return `<div style="margin:24px 0 0;padding:14px 16px;border-radius:14px;background:${BRAND.pillSoft};border:1px solid ${BRAND.pillSoftMid};font-size:14px;line-height:1.55;color:${BRAND.ink}">${html}</div>`
}

export function messageBlock(text: string): string {
  return `<div style="padding:16px 18px;border-radius:14px;background:${BRAND.background};border:1px solid ${BRAND.line};font-size:15px;line-height:1.6;color:${BRAND.ink};white-space:pre-wrap">${escapeHtml(text)}</div>`
}

export type EmailPropertyCard = {
  title: string
  url: string
  imageUrl?: string | null
  priceLabel?: string
  location?: string
  specs?: string
}

export function propertyCard(p: EmailPropertyCard): string {
  const img = p.imageUrl
    ? `<a href="${escapeHtml(p.url)}" style="text-decoration:none"><img src="${escapeHtml(p.imageUrl)}" width="536" alt="${escapeHtml(p.title)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:14px 14px 0 0;background:${BRAND.pillSoft}" /></a>`
    : ''
  const meta = [p.location, p.specs].filter(Boolean).map((s) => escapeHtml(s!)).join(' &middot; ')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;border:1px solid ${BRAND.line};border-radius:16px;background:${BRAND.surface}">
<tr><td style="padding:0">${img}</td></tr>
<tr><td style="padding:16px 18px 18px">
  <a href="${escapeHtml(p.url)}" style="font-size:17px;font-weight:800;color:${BRAND.ink};text-decoration:none">${escapeHtml(p.title)}</a>
  ${meta ? `<p style="margin:6px 0 0;font-size:13px;color:${BRAND.muted}">${meta}</p>` : ''}
  ${p.priceLabel ? `<p style="margin:10px 0 0;font-size:16px;font-weight:800;color:${BRAND.accentDeep}">${escapeHtml(p.priceLabel)}</p>` : ''}
  <p style="margin:14px 0 0">${button('View listing', p.url, 'outline')}</p>
</td></tr>
</table>`
}

/** Two-column photo grid (owner uploads). */
export function photoGrid(urls: string[]): string {
  const cells = urls.map(
    (u) =>
      `<td width="50%" style="padding:4px;vertical-align:top"><a href="${escapeHtml(u)}"><img src="${escapeHtml(u)}" width="264" alt="Submitted photo" style="display:block;width:100%;max-width:264px;height:auto;border:0;border-radius:10px" /></a></td>`,
  )
  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 2) {
    rows.push(`<tr>${cells[i]}${cells[i + 1] ?? '<td width="50%"></td>'}</tr>`)
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -4px">${rows.join('')}</table>`
}

export function brandedEmail(opts: {
  siteUrl?: string
  /** Inbox preview line */
  preheader: string
  eyebrow: string
  title: string
  intro?: string
  body: string
}): string {
  const base = siteBase(opts.siteUrl)
  const logo = `${base}/images/mojesu-logo-mark-88.png`
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.background};font-family:${FONT};color:${BRAND.ink};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.background}">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${BRAND.surface};border-radius:22px;overflow:hidden;border:1px solid ${BRAND.line}">
    <tr><td style="padding:22px 32px;background:${BRAND.pillSoft};border-bottom:3px solid ${BRAND.primary}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle"><img src="${logo}" width="40" height="40" alt="Mojesu" style="display:block;border:0;border-radius:10px" /></td>
        <td style="vertical-align:middle;padding-left:12px;font-size:20px;font-weight:800;letter-spacing:-.01em;color:${BRAND.ink}">Mojesu<span style="color:${BRAND.primaryDark}"> Properties</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.primaryDark}">${escapeHtml(opts.eyebrow)}</p>
      <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:800;color:${BRAND.ink}">${escapeHtml(opts.title)}</h1>
      ${opts.intro ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:${BRAND.muted}">${escapeHtml(opts.intro)}</p>` : ''}
    </td></tr>
    <tr><td style="padding:8px 32px 32px">${opts.body}</td></tr>
    <tr><td style="padding:22px 32px;background:${BRAND.accentDeep};color:#ffffff">
      <p style="margin:0;font-size:14px;font-weight:700">Mojesu Properties</p>
      <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#d6e6ef">Rent or buy your next home in Kampala.<br />
        <a href="${base}" style="color:#ffffff;text-decoration:underline">${escapeHtml(base.replace(/^https?:\/\//, ''))}</a> &middot;
        <a href="mailto:hello@mojesuproperties.com" style="color:#ffffff;text-decoration:underline">hello@mojesuproperties.com</a></p>
      <p style="margin:10px 0 0;font-size:11px;color:#a9c4d3">Sent automatically from a form on the Mojesu website.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`
}

/** Plain-text alternative — improves deliverability and accessibility. */
export function plainText(title: string, rows: DetailRow[], extra: string[] = []): string {
  return [
    `MOJESU PROPERTIES — ${title}`,
    '',
    ...rows.filter((r) => r.value?.trim()).map((r) => `${r.label}: ${r.value}`),
    ...(extra.length ? ['', ...extra] : []),
    '',
    'mojesuproperties.com · hello@mojesuproperties.com',
  ].join('\n')
}
