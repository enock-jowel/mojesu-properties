'use client'

import type {
  ContactEnquiryRequest,
  ContactEnquirySubmitResult,
} from './types'

const API_URL =
  process.env.NEXT_PUBLIC_CONTACT_API_URL ?? '/api/contact-enquiries'

/**
 * Submit a contact enquiry. On failure returns ok:false (no fake success).
 */
export async function submitContactEnquiryClient(
  req: ContactEnquiryRequest,
): Promise<ContactEnquirySubmitResult> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req,
        sourcePath:
          req.sourcePath ??
          (typeof window !== 'undefined' ? window.location.pathname : undefined),
      }),
    })

    const data = (await res.json().catch(() => ({}))) as ContactEnquirySubmitResult
    if (!res.ok) {
      return {
        ok: false,
        error: data.error || `Request failed (${res.status})`,
      }
    }
    return data
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}
