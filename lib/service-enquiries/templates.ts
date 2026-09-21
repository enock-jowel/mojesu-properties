import type { ServiceEnquiryRequest } from './types'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildEmailSubject(req: ServiceEnquiryRequest): string {
  return `Service enquiry — ${req.serviceName} (${req.name})`
}

export function buildEmailHtml(req: ServiceEnquiryRequest): string {
  const briefRows = Object.entries(req.brief)
    .map(
      ([k, v]) =>
        `<p style="margin:0 0 8px"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</p>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#2a2e32;line-height:1.5">
  <h2 style="margin:0 0 16px">Service enquiry</h2>
  <p style="margin:0 0 8px"><strong>Service:</strong> ${escapeHtml(req.serviceName)}</p>
  <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(req.name)}</p>
  <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(req.email)}</p>
  <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(req.phone)}</p>
  ${
    req.sourcePath
      ? `<p style="margin:0 0 8px"><strong>Page:</strong> ${escapeHtml(req.sourcePath)}</p>`
      : ''
  }
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
  ${briefRows || '<p style="margin:0">No brief fields</p>'}
</body>
</html>`
}
