/** CMS / Supabase listing row shapes (Phase 1 schema). */

export type CmsListingMode = 'rent' | 'sale'
export type CmsCategory = 'house' | 'apartment' | 'land' | 'commercial'
export type CmsStatus = 'draft' | 'published' | 'archived'
export type CmsAreaTier = 'prime' | 'mid-market' | 'emerging'
export type CmsTitleStatus = 'freehold' | 'leasehold' | 'mailo' | 'customary'

export type ListingImageRow = {
  id: string
  listing_id: string
  url: string
  is_cover: boolean | null
  room_tag: string | null
  sort_order: number | null
}

export type ListingRow = {
  id: string
  slug: string
  listing_mode: CmsListingMode
  category: CmsCategory
  status: CmsStatus
  title: string
  description: string | null
  area: string
  area_tier: CmsAreaTier | null
  address_internal: string | null
  price: number | null
  price_negotiable: boolean | null
  currency: string | null
  bedrooms: number | null
  bathrooms: number | null
  size_sqm: number | null
  furnishing: string | null
  year_built: number | null
  condition: string | null
  plot_dimensions: string | null
  plot_size_total: string | null
  surveyed: boolean | null
  topography: string | null
  zoning: string | null
  title_status: CmsTitleStatus | null
  encumbrances: string | null
  floor_area: number | null
  unit_type: string | null
  floor_count: number | null
  layout: string | null
  power_capacity: string | null
  deposit: number | null
  deposit_refundable: boolean | null
  min_lease_term: string | null
  included_utilities: string[] | null
  pet_policy: string | null
  available_from: string | null
  service_charge: number | null
  escalation_clause: string | null
  occupancy_status: string | null
  highlights: string[] | null
  amenities: string[] | null
  location_notes: string | null
  is_featured: boolean | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  listing_images?: ListingImageRow[] | null
}

export type ListingImageInput = {
  url: string
  is_cover?: boolean
  room_tag?: string | null
  sort_order?: number
}

/** Form / write payload for create & update. */
export type ListingWriteInput = {
  slug?: string
  listing_mode: CmsListingMode
  category: CmsCategory
  status: CmsStatus
  title: string
  description?: string | null
  area: string
  area_tier?: CmsAreaTier | null
  address_internal?: string | null
  price?: number | null
  price_negotiable?: boolean
  currency?: string
  bedrooms?: number | null
  bathrooms?: number | null
  size_sqm?: number | null
  furnishing?: string | null
  year_built?: number | null
  condition?: string | null
  plot_dimensions?: string | null
  plot_size_total?: string | null
  surveyed?: boolean | null
  topography?: string | null
  zoning?: string | null
  title_status?: CmsTitleStatus | null
  encumbrances?: string | null
  floor_area?: number | null
  unit_type?: string | null
  floor_count?: number | null
  layout?: string | null
  power_capacity?: string | null
  deposit?: number | null
  deposit_refundable?: boolean | null
  min_lease_term?: string | null
  included_utilities?: string[] | null
  pet_policy?: string | null
  available_from?: string | null
  service_charge?: number | null
  escalation_clause?: string | null
  occupancy_status?: string | null
  highlights?: string[] | null
  amenities?: string[] | null
  location_notes?: string | null
  is_featured?: boolean
  images: ListingImageInput[]
}
