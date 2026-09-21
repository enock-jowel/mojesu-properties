/** Admin overview dashboard snapshot (live aggregates + gap flags). */

export type CountRow = { key: string; label: string; count: number; href?: string }

export type SparkPoint = { label: string; count: number }

export type GapBlock = {
  title: string
  reason: string
  needs: string[]
}

export type IncompleteListing = {
  id: string
  title: string
  slug: string
  imageCount: number
  href: string
}

export type StaffAction = {
  listingId: string
  title: string
  action: 'created' | 'published' | 'edited'
  at: string
  actorId: string | null
  actorName: string
  href: string
}

export type StaffLogin = {
  id: string
  fullName: string | null
  email: string
  role: 'admin' | 'staff'
  lastSignInAt: string | null
}

export type TopBookedListing = {
  listingId: string
  title: string
  slug: string | null
  bookingCount: number
  href: string | null
}

export type DashboardSnapshot = {
  generatedAt: string
  cacheSeconds: number

  summary: {
    activeListings: number
    draftListings: number
    archivedListings: number
    totalLeadsTracked: number
    viewingBookingsTotal: number
    estimatedPassRevenueUgx: number | null
    revenueNote: string | null
  }

  listings: {
    byStatus: CountRow[]
    byCategory: CountRow[]
    byMode: CountRow[]
    categorySchemaNote: string
    modeSchemaNote: string
    topAreas: CountRow[]
    newThisWeek: number
    newThisMonth: number
    createdTrend: SparkPoint[]
    incomplete: IncompleteListing[]
    incompleteNote: string
  }

  leads: {
    dateFrom: string | null
    dateTo: string | null
    submissionsTotal: number
    submissionsInRange: number
    bookingsAsLeadsInRange: number
    submissionStatus: CountRow[]
    sources: CountRow[]
    gaps: GapBlock[]
  }

  viewings: {
    totalBookings: number
    confirmedOrCompleted: number
    bookedThisWeek: number
    bookedThisMonth: number
    feeUgx: number
    estimatedRevenueUgx: number
    revenueIsEstimate: true
    topProperties: TopBookedListing[]
    byStatus: CountRow[]
  }

  staff: {
    adminCount: number
    staffCount: number
    authUserCount: number | null
    authUserNote: string | null
    recentActions: StaffAction[]
    logins: StaffLogin[]
    gaps: GapBlock[]
  }

  performance: {
    gaps: GapBlock[]
  }
}
