import type { ContactEnquiryRequest } from './types'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildEmailSubject(req: ContactEnquiryRequest): string {
  return `New contact enquiry — ${req.name} (${req.purpose})`
}

export function buildEmailHtml(req: ContactEnquiryRequest): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#2a2e32;line-height:1.5">
  <h2 style="margin:0 0 16px">New contact enquiry</h2>
  <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(req.name)}</p>
  <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(req.email)}</p>
  <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(req.phone)}</p>
  <p style="margin:0 0 8px"><strong>Purpose:</strong> ${escapeHtml(req.purpose)}</p>
  <p style="margin:0 0 8px"><strong>Area:</strong> ${escapeHtml(req.location)}</p>
  ${
    req.sourcePath
      ? `<p style="margin:0 0 8px"><strong>Page:</strong> ${escapeHtml(req.sourcePath)}</p>`
      : ''
  }
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
  <p style="margin:0;white-space:pre-wrap">${escapeHtml(req.message)}</p>
</body>
</html>`
}
