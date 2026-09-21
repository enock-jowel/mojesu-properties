export type ContactEnquiryStatus =
  | 'new'
  | 'contacted'
  | 'converted'
  | 'closed'

export type ContactEnquiryRequest = {
  purpose: string
  location: string
  message: string
  name: string
  email: string
  phone: string
  sourcePath?: string
  turnstileToken?: string
}

export type ContactEnquirySubmitResult = {
  ok: boolean
  enquiryId?: string
  emailSent?: boolean
  error?: string
}
