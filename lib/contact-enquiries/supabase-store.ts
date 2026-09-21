import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContactEnquiryRequest } from './types'

export type ContactEnquiryRow = ContactEnquiryRequest & {
  id: string
  status: string
  createdAt: string
}

export function createSupabaseContactStore(supabase: SupabaseClient) {
  return {
    async insert(row: ContactEnquiryRow): Promise<void> {
      const { error } = await supabase.from('contact_enquiries').insert({
        id: row.id,
        purpose: row.purpose,
        location: row.location,
        message: row.message,
        name: row.name,
        email: row.email,
        phone: row.phone,
        source_path: row.sourcePath ?? null,
        status: row.status,
        created_at: row.createdAt,
      })
      if (error) throw new Error(error.message)
    },
  }
}
