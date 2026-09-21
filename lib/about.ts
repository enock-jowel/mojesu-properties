/**
 * About page content — layout mirrored from Revalis `/about`.
 */

export type AboutHighlight = {
  title: string
  description: string
  iconClass: string
}

export type AboutApproachItem = {
  title: string
  description: string
  iconClass: string
}

export type AboutFaq = {
  question: string
  answer: string
}

export const ABOUT_HERO = {
  eyebrow: 'who we are',
  title: 'Real estate expertise built on trust and results.',
  highlights: [
    {
      title: 'Market Intelligence',
      description:
        'We combine local Kampala knowledge and real market data to help clients make informed property decisions.',
      iconClass: 'fi fi-rr-chart-histogram',
    },
    {
      title: 'Tailored Guidance',
      description:
        'Every client receives personalized support designed around their goals, timeline, and investment plans.',
      iconClass: 'fi fi-rr-bolt',
    },
  ] satisfies AboutHighlight[],
  ctaLabel: 'Get in touch',
  ctaHref: '#contact',
  images: {
    primary:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=70',
    secondary:
      'https://images.unsplash.com/photo-1719887805632-de5be825f72b?auto=format&fit=crop&w=900&q=70',
  },
  statCard: {
    value: '35+',
    label: 'Industry Professionals',
  },
}

export const ABOUT_STORY = {
  eyebrow: 'ABOUT MOJESU',
  title: 'We help find homes where life’s best moments unfold',
  body: 'We do more than list properties. Our team works closely with buyers, renters, and investors to discover homes that match their vision, lifestyle & long-term goals—from first viewing to final closing.',
  apartTitle: 'What Sets Us Apart:',
  apartItems: [
    'Carefully curated listings across Kampala’s most sought-after neighbourhoods.',
    'Honest guidance backed by local market expertise.',
    'Dedicated support from discovery to successful closing.',
  ],
  stats: [
    { value: '180+', label: 'Homes represented' },
    { value: '95%', label: 'Client recommendation' },
  ],
  images: {
    left: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=70',
    right:
      'https://images.unsplash.com/photo-1745761320791-5ae142edee8c?auto=format&fit=crop&w=800&q=70',
  },
}

export const ABOUT_VIDEO = {
  title: 'Guiding smarter property decisions with insight & experience.',
  /** YouTube poster fallback */
  image: 'https://i.ytimg.com/vi/4c9_zZJlZRw/maxresdefault.jpg',
  videoId: '4c9_zZJlZRw',
  videoUrl: 'https://www.youtube.com/watch?v=4c9_zZJlZRw',
}

export const ABOUT_AGENTS_INTRO = {
  eyebrow: 'our agents',
  title: 'Meet the experts guiding every move',
  body: 'Our agents combine market knowledge, expertise & local insight to help clients find properties with confidence.',
  ctaBlurb:
    'We bring deep local knowledge, strong negotiation skills & personalized service to every client. Together, we help buyers, sellers & investors navigate the market and achieve their real estate goals.',
  ctaLabel: 'See all agents',
  ctaHref: '#agents',
}

export const ABOUT_APPROACH = {
  eyebrow: 'OUR APPROACH',
  title: 'Helping you navigate decisions with confidence',
  body: 'Our team combines local expertise, insights & personalized support to help you make smarter real estate decisions.',
  image:
    'https://images.unsplash.com/photo-1598710951575-8f7d0346c24e?auto=format&fit=crop&w=1200&q=70',
  items: [
    {
      title: 'Market Research',
      description:
        'We study local market trends, neighbourhood dynamics, and pricing data to help clients understand opportunities and make informed property decisions.',
      iconClass: 'fi fi-rr-chart-histogram',
    },
    {
      title: 'Property Strategy',
      description:
        'Our team helps clients define their goals and identify properties that align with their lifestyle, timeline, and long-term investment plans.',
      iconClass: 'fi fi-rr-building',
    },
    {
      title: 'Neighbourhood Matching',
      description:
        'From Ntinda to Naalya and beyond, we map your lifestyle needs to areas with the right schools, commute, amenities, and long-term growth potential.',
      iconClass: 'fi fi-rr-map',
    },
    {
      title: 'Negotiation Expertise',
      description:
        'With strong market knowledge and negotiation experience, we work to secure favorable terms and the best possible value in every transaction.',
      iconClass: 'fi fi-rr-handshake',
    },
    {
      title: 'Due Diligence',
      description:
        'We coordinate title checks, surveys, and document review so you understand risks early — before deposits, offers, or handover.',
      iconClass: 'fi fi-rr-document',
    },
    {
      title: 'Viewing Coordination',
      description:
        'Schedules, access, and follow-ups are handled for you so every visit is purposeful and you can compare options with clarity.',
      iconClass: 'fi fi-rr-calendar',
    },
    {
      title: 'End-to-End Support',
      description:
        'From the initial search and property viewings to contracts and closing, we guide clients through each step with clarity and confidence.',
      iconClass: 'fi fi-rr-check-circle',
    },
    {
      title: 'Aftercare Guidance',
      description:
        'Need management, valuation, or facilities support after you move? We stay available with practical next steps tailored to your property.',
      iconClass: 'fi fi-rr-headset',
    },
  ] satisfies AboutApproachItem[],
}

export const ABOUT_FAQS: AboutFaq[] = [
  {
    question: 'How does Mojesu help buyers find the right property?',
    answer:
      'Mojesu combines deep local market knowledge, personalized property searches, and skilled negotiation to help buyers secure homes that match their goals, budget & lifestyle across Kampala.',
  },
  {
    question: 'What areas in Kampala do you serve?',
    answer:
      'We cover Greater Kampala and nearby growth corridors — including Ntinda, Naalya, Kira, Najjera, Kololo, Bugolobi, and Mukono — with agents who know each neighbourhood well.',
  },
  {
    question: 'How long does it typically take to close on a home?',
    answer:
      'Timelines vary with title status and financing, but most straightforward purchases move from offer to closing within a few weeks to a few months. We keep you informed at every stage.',
  },
  {
    question: 'Do you assist with property pricing and valuation?',
    answer:
      'Yes. Our valuation & consultancy service provides evidence-based pricing for sale, mortgage, insurance, and investment decisions, grounded in recent local comparables.',
  },
  {
    question: 'What makes Mojesu different from other agencies?',
    answer:
      'We focus on verified listings, clear guidance for renters and buyers, and practical support — from agent-assisted search to surveying, management, and development consulting — under one trusted team.',
  },
]
