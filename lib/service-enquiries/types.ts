export type ServiceEnquiryStatus =
  | 'new'
  | 'contacted'
  | 'quoted'
  | 'won'
  | 'closed'

export type ServiceEnquiryRequest = {
  serviceId?: string
  serviceSlug?: string
  serviceName: string
  brief: Record<string, string>
  name: string
  email: string
  phone: string
  sourcePath?: string
  turnstileToken?: string
}

export type ServiceEnquirySubmitResult = {
  ok: boolean
  enquiryId?: string
  emailSent?: boolean
  error?: string
}
