/**
 * List With Us — page content shaped like a single-service detail page.
 * Intake only: Mojesu verifies, photographs, and creates the live listing.
 */

export type ListWithUsOffering = {
  title: string
  description: string
  iconClass: string
}

export type ListWithUsProcessStep = {
  title: string
  description: string
}

export type ListWithUsContent = {
  name: string
  heroDescription: string
  image: string
  imageAlt: string
  cardTitle: string
  cardSubtitle: string
  ctaLabel: string
  footerNote: string
  whatWeDo: {
    title: string
    body: string
    image: string
    imageAlt: string
  }
  offerings: {
    title: string
    body: string
    items: ListWithUsOffering[]
  }
  process: {
    title: string
    body: string
    image: string
    imageAlt: string
    steps: ListWithUsProcessStep[]
  }
  /** Related service slugs shown in the sidebar / mobile footer */
  relatedServiceSlugs: string[]
}

export const LIST_WITH_US: ListWithUsContent = {
  name: 'List With Us',
  heroDescription:
    'Have a home, land, or commercial space to rent or sell? Request a visit and Mojesu will verify, photograph, and list your property for you — no self-serve publishing required.',
  image:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=70',
  imageAlt: 'Modern home exterior ready for listing',
  cardTitle: 'Request a visit',
  cardSubtitle:
    'Share a few details — we’ll contact you within 24–48 hours to arrange the property visit.',
  ctaLabel: 'Request a visit',
  footerNote:
    'Intake only — nothing goes live until we’ve visited, verified, and created the listing ourselves.',
  whatWeDo: {
    title: 'We list your property on your behalf',
    body: 'You don’t need to write a listing, shoot photos, or manage the upload. Tell us what you’re offering, we’ll visit the property, confirm the details, and publish a polished Mojesu listing when everything checks out.',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=70',
    imageAlt: 'Agent reviewing property keys with homeowner',
  },
  offerings: {
    title: 'What’s included when you list with Mojesu',
    body: 'From the first visit through enquiries, we handle the work that makes a listing trustworthy and marketable.',
    items: [
      {
        title: 'Property Visit & Verification',
        description:
          'We confirm location, condition, and key facts on-site before anything is published.',
        iconClass: 'fi fi-rr-checkbox',
      },
      {
        title: 'Professional Photography',
        description:
          'Our team captures listing-ready photos during the visit — your snaps are optional.',
        iconClass: 'fi fi-rr-camera',
      },
      {
        title: 'Polished Listing Creation',
        description:
          'We write and publish the live listing with accurate details, pricing, and amenities.',
        iconClass: 'fi fi-rr-document',
      },
      {
        title: 'Buyer & Tenant Enquiries',
        description:
          'Interested clients reach Mojesu first — we screen and coordinate viewings for you.',
        iconClass: 'fi fi-rr-comment',
      },
    ],
  },
  process: {
    title: 'A simple path from request to live listing',
    body: 'Four clear steps — you request the visit, we do the verification and creative work, then your property goes live on Mojesu.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70',
    imageAlt: 'Bright residential property exterior',
    steps: [
      {
        title: 'Submit your request',
        description:
          'Tell us rent or sell, property type, area, and rough details. Approximate info is fine.',
      },
      {
        title: 'We arrange a visit',
        description:
          'Our team contacts you within 24–48 hours to schedule verification and photography.',
      },
      {
        title: 'Verify & photograph',
        description:
          'On-site we confirm the facts, capture professional photos, and note anything buyers need to know.',
      },
      {
        title: 'Listing goes live',
        description:
          'We create and publish the Mojesu listing, then manage enquiries and viewing requests.',
      },
    ],
  },
  relatedServiceSlugs: [
    'property-management',
    'valuation',
    'agent-search',
  ],
}
