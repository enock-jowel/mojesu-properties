import type { SupabaseClient } from '@supabase/supabase-js'
import type { ServiceEnquiryRequest } from './types'

export type ServiceEnquiryRow = ServiceEnquiryRequest & {
  id: string
  status: string
  createdAt: string
}

export function createSupabaseServiceEnquiryStore(supabase: SupabaseClient) {
  return {
    async insert(row: ServiceEnquiryRow): Promise<void> {
      const { error } = await supabase.from('service_enquiries').insert({
        id: row.id,
        service_id: row.serviceId ?? null,
        service_slug: row.serviceSlug ?? null,
        service_name: row.serviceName,
        brief: row.brief,
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
