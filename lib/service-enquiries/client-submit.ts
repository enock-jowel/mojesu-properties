'use client'

import type {
  ServiceEnquiryRequest,
  ServiceEnquirySubmitResult,
} from './types'

const API_URL =
  process.env.NEXT_PUBLIC_SERVICE_ENQUIRY_API_URL ?? '/api/service-enquiries'

export async function submitServiceEnquiryClient(
  req: ServiceEnquiryRequest,
): Promise<ServiceEnquirySubmitResult> {
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

    const data = (await res.json().catch(() => ({}))) as ServiceEnquirySubmitResult
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
