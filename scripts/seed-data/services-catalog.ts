/** Seed catalog for services — scripts/seed-content.ts only. */
import type { ServiceDetail } from '../../lib/services'

const SERVICES: ServiceDetail[] = [
  {
    id: 'property-management',
    slug: 'property-management',
    name: 'Property Management',
    description:
      'Rent collection, maintenance, and tenant management for landlords',
    heroDescription:
      'We help landlords protect income and property condition — from tenant placement and rent collection to maintenance coordination and clear reporting across Kampala.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Modern Kampala-area home under professional property management',
    iconClass: 'fi fi-sr-building',
    enquiry: {
      ctaLabel: 'Request management',
      cardTitle: 'Property management',
      cardSubtitle: 'Tell us about your rental — we’ll follow up within one business day.',
      briefStepTitle: 'About your property',
      fields: [
        {
          id: 'propertyType',
          label: 'Property type',
          type: 'choice',
          required: true,
          options: ['Apartment', 'House', 'Multi-unit', 'Commercial'],
        },
        {
          id: 'location',
          label: 'Location',
          type: 'text',
          required: true,
          placeholder: 'e.g. Ntinda, Kampala',
        },
        {
          id: 'units',
          label: 'Units to manage',
          type: 'choice',
          required: true,
          options: ['1', '2–4', '5–10', '10+'],
        },
      ],
      footerNote: 'No obligation — we’ll confirm scope and fees before anything starts.',
      reviewLabel: 'Management enquiry',
    },
    whatWeDo: {
      title: 'Hands-on management that protects your rental income',
      body: 'We take day-to-day landlord work off your plate — screening tenants, collecting rent, coordinating repairs, and keeping you informed so your property stays occupied and cared for.',
      image:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'Managed residential property exterior in a Kampala neighbourhood',
    },
    offerings: {
      title: 'Key services for landlords who want reliable oversight',
      body: 'Our management package covers the full rental cycle — from finding the right tenant to keeping the property maintained and financially clear.',
      items: [
        {
          title: 'Tenant Placement',
          description:
            'We market the listing, screen applicants, and place reliable tenants aligned with your terms.',
          iconClass: 'fi fi-rr-user',
        },
        {
          title: 'Rent Collection',
          description:
            'Structured collection and follow-up so rent arrives on time with clear monthly records.',
          iconClass: 'fi fi-rr-wallet',
        },
        {
          title: 'Maintenance Coordination',
          description:
            'We triage issues, dispatch trusted trades, and keep costs and timelines transparent.',
          iconClass: 'fi fi-rr-tool-box',
        },
        {
          title: 'Owner Reporting',
          description:
            'Regular updates on occupancy, income, expenses, and upcoming work on your property.',
          iconClass: 'fi fi-rr-document',
        },
      ],
    },
    process: {
      title: 'Our structured approach to property management',
      body: 'We set clear terms up front, place the right tenant, and run a repeatable operating rhythm so you always know where things stand.',
      image:
        'https://images.unsplash.com/photo-1758519289200-384c7ef2d163?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'African property manager meeting with a landlord client',
      steps: [
        {
          title: 'Brief & Handover',
          description:
            'We review your property, rent goals, house rules, and preferred maintenance approach.',
        },
        {
          title: 'Tenant Placement',
          description:
            'We list, screen, and onboard tenants with deposits and agreements properly handled.',
        },
        {
          title: 'Active Management',
          description:
            'Rent collection, inspections, and maintenance run on an agreed schedule.',
        },
        {
          title: 'Ongoing Reporting',
          description:
            'You receive clear updates so decisions stay informed without daily involvement.',
        },
      ],
    },
  },
  {
    id: 'valuation',
    slug: 'valuation',
    name: 'Valuation & Consultancy',
    description:
      'Professional property valuation for sale, mortgage, or insurance purposes',
    heroDescription:
      'We deliver grounded market valuations and clear advice — whether you are selling, financing, insuring, or deciding what a property is really worth in today’s Kampala market.',
    image:
      'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'African valuation analyst reviewing property market data',
    iconClass: 'fi fi-sr-clipboard-list-check',
    enquiry: {
      ctaLabel: 'Request a valuation',
      cardTitle: 'Valuation & consultancy',
      cardSubtitle: 'Share the brief — we’ll schedule an inspection and report back.',
      briefStepTitle: 'Valuation brief',
      fields: [
        {
          id: 'purpose',
          label: 'Purpose',
          type: 'choice',
          required: true,
          options: ['Sale pricing', 'Mortgage', 'Insurance', 'Investment'],
        },
        {
          id: 'location',
          label: 'Property location',
          type: 'text',
          required: true,
          placeholder: 'Area and landmark',
        },
        {
          id: 'propertyType',
          label: 'Property type',
          type: 'choice',
          required: true,
          options: ['Residential', 'Land', 'Commercial'],
        },
      ],
      footerNote: 'Reports are prepared after inspection — timeline confirmed on call.',
      reviewLabel: 'Valuation enquiry',
    },
    whatWeDo: {
      title: 'Clear valuations grounded in local market evidence',
      body: 'Our consultancy combines comparable sales, neighbourhood demand, and property condition so you can price, negotiate, or report with confidence.',
      image:
        'https://images.unsplash.com/photo-1616805765352-beedbad46b2a?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'African valuation consultant in professional attire',
    },
    offerings: {
      title: 'Key services for owners, buyers, and lenders',
      body: 'From sale pricing to mortgage and insurance support, we provide valuations and advice you can act on.',
      items: [
        {
          title: 'Market Valuation',
          description:
            'Evidence-based estimates using recent comparables and current neighbourhood demand.',
          iconClass: 'fi fi-rr-chart-histogram',
        },
        {
          title: 'Sale Pricing Advice',
          description:
            'Recommended asking ranges and positioning so listings attract serious interest.',
          iconClass: 'fi fi-rr-tags',
        },
        {
          title: 'Mortgage Support',
          description:
            'Valuation documentation prepared to support financing conversations with lenders.',
          iconClass: 'fi fi-rr-bank',
        },
        {
          title: 'Investment Review',
          description:
            'Yield, risk, and hold-period guidance for residential and commercial opportunities.',
          iconClass: 'fi fi-rr-stats',
        },
      ],
    },
    process: {
      title: 'Our structured approach to valuation',
      body: 'We inspect, research, and present findings in plain language so your next decision is well supported.',
      image:
        'https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'African professional preparing an evidence-based valuation brief',
      steps: [
        {
          title: 'Scope the Brief',
          description:
            'We confirm purpose — sale, mortgage, insurance, or investment — and required output.',
        },
        {
          title: 'Inspect & Measure',
          description:
            'On-site review of condition, size, finishes, and factors that affect value.',
        },
        {
          title: 'Market Evidence',
          description:
            'We analyse comparable transactions and active demand in the same area.',
        },
        {
          title: 'Report & Advise',
          description:
            'You receive a clear valuation with practical recommendations for next steps.',
        },
      ],
    },
  },
  {
    id: 'surveying',
    slug: 'surveying',
    name: 'Land Surveying & Title Verification',
    description: 'Confirm boundaries and title status before you buy',
    heroDescription:
      'We help buyers and owners verify boundaries, beacons, and title status before money changes hands — reducing the risk of disputes, overlaps, and costly surprises.',
    image:
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Open land parcel in Uganda prepared for survey and title work',
    iconClass: 'fi fi-sr-ruler-triangle',
    enquiry: {
      ctaLabel: 'Request a survey check',
      cardTitle: 'Surveying & title',
      cardSubtitle: 'Confirm boundaries and title status before you commit funds.',
      briefStepTitle: 'Land details',
      fields: [
        {
          id: 'need',
          label: 'What do you need?',
          type: 'choice',
          required: true,
          options: ['Boundary survey', 'Title verification', 'Both'],
        },
        {
          id: 'location',
          label: 'Plot location',
          type: 'text',
          required: true,
          placeholder: 'Village / parish / road',
        },
        {
          id: 'titleStatus',
          label: 'Title status',
          type: 'choice',
          required: true,
          options: ['Freehold', 'Leasehold', 'Kibanja', 'Not sure'],
        },
      ],
      footerNote: 'Bring any title copies you have — we’ll tell you what’s missing.',
      reviewLabel: 'Survey enquiry',
    },
    whatWeDo: {
      title: 'Boundary clarity and title checks before you commit',
      body: 'We coordinate surveying and title verification so you know exactly what you are buying — plot extent, beacon status, and documentation readiness.',
      image:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'East African countryside plot ready for boundary survey',
    },
    offerings: {
      title: 'Key services for land buyers and owners',
      body: 'From beacon checks to title review, we help you confirm the land story before purchase or development.',
      items: [
        {
          title: 'Boundary Survey',
          description:
            'Professional measurement and beacon confirmation against the registered plot.',
          iconClass: 'fi fi-rr-ruler-triangle',
        },
        {
          title: 'Title Verification',
          description:
            'Review of title documents and status so ownership claims are clear before payment.',
          iconClass: 'fi fi-rr-check-circle',
        },
        {
          title: 'Encumbrance Checks',
          description:
            'Support identifying caveats, overlaps, or issues that could block a clean transfer.',
          iconClass: 'fi fi-rr-search',
        },
        {
          title: 'Purchase Guidance',
          description:
            'Practical sequencing for deposits, due diligence, and transfer milestones.',
          iconClass: 'fi fi-rr-handshake',
        },
      ],
    },
    process: {
      title: 'Our structured approach to land due diligence',
      body: 'We move step by step from document review to field confirmation so risk is visible early.',
      image:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'Rolling East African landscape under survey and planning review',
      steps: [
        {
          title: 'Document Intake',
          description:
            'We collect title copies, search letters, and seller details for initial review.',
        },
        {
          title: 'Field Survey',
          description:
            'Boundaries and beacons are checked on site against the registered description.',
        },
        {
          title: 'Title Confirmation',
          description:
            'Findings are matched to title status and any issues are flagged clearly.',
        },
        {
          title: 'Go / No-Go Advice',
          description:
            'You receive a clear recommendation before committing further funds.',
        },
      ],
    },
  },
  {
    id: 'agent-search',
    slug: 'agent-search',
    name: 'Agent-Assisted Search',
    description: 'Work with a dedicated agent instead of browsing solo',
    heroDescription:
      'Skip endless scrolling — a dedicated Mojesu agent shortlists homes that match your budget, neighbourhoods, and lifestyle, then coordinates viewings until you decide.',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Luxury Kampala villa prepared for an agent-led home search',
    iconClass: 'fi fi-sr-user-headset',
    enquiry: {
      ctaLabel: 'Start my search',
      cardTitle: 'Agent-assisted search',
      cardSubtitle: 'A dedicated agent shortlists matches and books viewings for you.',
      briefStepTitle: 'What are you looking for?',
      fields: [
        {
          id: 'intent',
          label: 'I want to',
          type: 'choice',
          required: true,
          options: ['Rent', 'Buy', 'Either'],
        },
        {
          id: 'budget',
          label: 'Budget (UGX)',
          type: 'text',
          required: true,
          placeholder: 'e.g. 1.5M / month or 250M purchase',
        },
        {
          id: 'areas',
          label: 'Preferred areas',
          type: 'text',
          required: true,
          placeholder: 'e.g. Naalya, Kira, Ntinda',
        },
      ],
      footerNote: 'We’ll call to refine your brief before sharing a shortlist.',
      reviewLabel: 'Search enquiry',
    },
    whatWeDo: {
      title: 'Guided search with a dedicated agent by your side',
      body: 'We translate your brief into a focused shortlist, arrange viewings efficiently, and help you compare options so you move from interest to decision with clarity.',
      image:
        'https://images.unsplash.com/photo-1758519289200-384c7ef2d163?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'African real estate advisor meeting a homebuyer',
    },
    offerings: {
      title: 'Key services for buyers and renters who want guidance',
      body: 'From briefing to negotiation support, your agent stays with you through the search.',
      items: [
        {
          title: 'Needs Briefing',
          description:
            'We define budget, areas, property type, and must-haves before any shortlist.',
          iconClass: 'fi fi-rr-list-check',
        },
        {
          title: 'Curated Shortlist',
          description:
            'Only properties that fit — shared with clear notes on trade-offs and timing.',
          iconClass: 'fi fi-rr-home',
        },
        {
          title: 'Viewing Coordination',
          description:
            'Schedules, access, and follow-ups handled so you can focus on the homes.',
          iconClass: 'fi fi-rr-calendar',
        },
        {
          title: 'Offer Support',
          description:
            'Guidance on pricing, terms, and next steps when you are ready to proceed.',
          iconClass: 'fi fi-rr-handshake',
        },
      ],
    },
    process: {
      title: 'Our structured approach to assisted search',
      body: 'A simple rhythm — brief, shortlist, view, decide — with an agent accountable for progress.',
      image:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'Luxury home interior during a guided Kampala property viewing',
      steps: [
        {
          title: 'Understand Needs',
          description:
            'Budget, neighbourhoods, lifestyle, and timeline are confirmed in the first call.',
        },
        {
          title: 'Property Selection',
          description:
            'We shortlist matches and organise viewings around your availability.',
        },
        {
          title: 'Compare & Decide',
          description:
            'After viewings, we help you weigh options against your original brief.',
        },
        {
          title: 'Secure Next Steps',
          description:
            'We support offers, negotiations, and handoff into closing or lease steps.',
        },
      ],
    },
  },
  {
    id: 'development',
    slug: 'development',
    name: 'Development Consulting',
    description:
      'Planning and cost guidance for building on land you own or are buying',
    heroDescription:
      'Planning a build on land you own or are acquiring? We help you think through feasibility, sequencing, and cost realism before you commit to drawings and contractors.',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Residential development construction progressing in Kampala',
    iconClass: 'fi fi-sr-hard-hat',
    enquiry: {
      ctaLabel: 'Book a consult',
      cardTitle: 'Development consulting',
      cardSubtitle: 'Pressure-test your build idea before heavy design spend.',
      briefStepTitle: 'Project brief',
      fields: [
        {
          id: 'landStatus',
          label: 'Land status',
          type: 'choice',
          required: true,
          options: ['I own land', 'Buying land', 'Exploring'],
        },
        {
          id: 'intendedUse',
          label: 'Intended use',
          type: 'choice',
          required: true,
          options: ['Home', 'Rental units', 'Commercial', 'Mixed'],
        },
        {
          id: 'location',
          label: 'Site location',
          type: 'text',
          required: true,
          placeholder: 'Area or plot reference',
        },
      ],
      footerNote: 'First consult clarifies feasibility, sequence, and next specialists.',
      reviewLabel: 'Development enquiry',
    },
    whatWeDo: {
      title: 'Practical planning before you break ground',
      body: 'We help owners and buyers pressure-test development ideas — what fits the land, what it may cost, and which sequence reduces risk.',
      image:
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'Active construction site for a Ugandan property development',
    },
    offerings: {
      title: 'Key services for landowners and aspiring developers',
      body: 'From concept feasibility to cost framing, we bring structure to early development decisions.',
      items: [
        {
          title: 'Feasibility Review',
          description:
            'High-level fit of use, scale, and site constraints before heavy design spend.',
          iconClass: 'fi fi-rr-map',
        },
        {
          title: 'Cost Framing',
          description:
            'Order-of-magnitude cost ranges so budgets stay realistic from the start.',
          iconClass: 'fi fi-rr-calculator',
        },
        {
          title: 'Sequencing Advice',
          description:
            'Recommended order for surveys, permits, design, and contractor engagement.',
          iconClass: 'fi fi-rr-time-fast',
        },
        {
          title: 'Partner Referrals',
          description:
            'Introductions to surveyors, architects, and builders when you are ready.',
          iconClass: 'fi fi-rr-users',
        },
      ],
    },
    process: {
      title: 'Our structured approach to development consulting',
      body: 'We keep early decisions light and evidence-based so you invest in the right next step.',
      image:
        'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'African development advisor reviewing project numbers and plans',
      steps: [
        {
          title: 'Site & Intent',
          description:
            'We clarify land status, intended use, and your budget envelope.',
        },
        {
          title: 'Options Outline',
          description:
            'Viable build paths are sketched with trade-offs on cost, time, and complexity.',
        },
        {
          title: 'Cost & Risk Pass',
          description:
            'Major cost drivers and risks are flagged before detailed design begins.',
        },
        {
          title: 'Next-Step Plan',
          description:
            'You leave with a clear sequence and the right specialists to engage.',
        },
      ],
    },
  },
  {
    id: 'facilities',
    slug: 'facilities',
    name: 'Facilities Management',
    description:
      'Ongoing management for commercial and multi-unit portfolios',
    heroDescription:
      'Keep multi-unit and commercial assets running smoothly — cleaning, security coordination, vendor oversight, and operational routines that protect tenants and asset value.',
    image:
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&q=70',
    imageAlt: 'Modern multi-unit property under facilities management',
    iconClass: 'fi fi-sr-wrench-simple',
    enquiry: {
      ctaLabel: 'Request facilities support',
      cardTitle: 'Facilities management',
      cardSubtitle: 'Keep multi-unit and commercial buildings running day to day.',
      briefStepTitle: 'About the building',
      fields: [
        {
          id: 'assetType',
          label: 'Asset type',
          type: 'choice',
          required: true,
          options: ['Apartments', 'Offices', 'Retail', 'Mixed'],
        },
        {
          id: 'scale',
          label: 'Scale',
          type: 'choice',
          required: true,
          options: ['Under 10 units', '10–30', '30+', 'Full building'],
        },
        {
          id: 'location',
          label: 'Location',
          type: 'text',
          required: true,
          placeholder: 'Building / area',
        },
      ],
      footerNote: 'We’ll assess vendors and standards before proposing an operating plan.',
      reviewLabel: 'Facilities enquiry',
    },
    whatWeDo: {
      title: 'Operations that keep buildings working every day',
      body: 'We run the operational backbone of multi-unit and commercial properties — vendors, schedules, incident response, and standards that tenants notice.',
      image:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'Well-kept residential compound exterior under facilities care',
    },
    offerings: {
      title: 'Key services for commercial and multi-unit owners',
      body: 'From preventive maintenance to vendor control, we keep facilities predictable and presentable.',
      items: [
        {
          title: 'Vendor Oversight',
          description:
            'Cleaning, security, and maintenance partners coordinated to agreed standards.',
          iconClass: 'fi fi-rr-briefcase',
        },
        {
          title: 'Preventive Maintenance',
          description:
            'Scheduled checks that reduce downtime and protect building systems.',
          iconClass: 'fi fi-rr-settings',
        },
        {
          title: 'Incident Response',
          description:
            'Clear escalation paths when faults, access issues, or emergencies arise.',
          iconClass: 'fi fi-rr-bell',
        },
        {
          title: 'Performance Reporting',
          description:
            'Operational summaries so owners see issues, costs, and completed work.',
          iconClass: 'fi fi-rr-chart-pie',
        },
      ],
    },
    process: {
      title: 'Our structured approach to facilities management',
      body: 'We set standards, staff the routines, and report performance so operations stay visible.',
      image:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1400&q=70',
      imageAlt: 'African facilities coordinator managing property operations',
      steps: [
        {
          title: 'Site Assessment',
          description:
            'We audit current vendors, standards, and pain points across the property.',
        },
        {
          title: 'Operating Plan',
          description:
            'Schedules, SLAs, and escalation paths are agreed with ownership.',
        },
        {
          title: 'Day-to-Day Delivery',
          description:
            'Teams execute cleaning, maintenance, and response routines consistently.',
        },
        {
          title: 'Review & Improve',
          description:
            'Regular reviews tighten costs, quality, and tenant experience over time.',
        },
      ],
    },
  },
]


export function getSeedServices(): ServiceDetail[] {
  return [...SERVICES]
}
