/**
 * Fallback site content — used when DB row missing / unreachable.
 * Seed script upserts these into site_content.
 */
import {
  ABOUT_APPROACH,
  ABOUT_FAQS,
  ABOUT_HERO,
  ABOUT_STORY,
  ABOUT_VIDEO,
} from '@/lib/about'
import { LIST_WITH_US } from '@/lib/list-with-us'
import {
  DEFAULT_AREAS,
  DEFAULT_FORMS,
  DEFAULT_NAV,
  DEFAULT_TAXONOMY,
  DEFAULT_VIEWING,
} from '@/lib/site-content/catalog-defaults'
import type {
  AboutContent,
  CompanyContent,
  ContactContent,
  HomeContent,
  ListWithUsContent,
  SiteContentMap,
} from '@/lib/site-content/types'

export const DEFAULT_COMPANY: CompanyContent = {
  email: 'hello@mojesuproperties.com',
  phoneDisplay: '0393 102 782 / 0780 827 159',
  phoneTel: '256780827159',
  address: 'Naalya, Namugongo Road · Mon–Fri 9:00–18:00, Sat 9:00–14:00',
  addressShort: 'Kampala, Uganda',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=Kampala+Road+Kampala+Uganda',
  footerBlurb: 'Trusted Expertise, Exceptional Realty',
  socials: [
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@mojesu.properties',
      iconClass: 'fi fi-brands-tik-tok',
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@Mojesupropertiesuganda3292',
      iconClass: 'fi fi-brands-youtube',
    },
  ],
}

export const DEFAULT_CONTACT: ContactContent = {
  eyebrow: 'Contact us',
  titleBefore: 'Ready to find your',
  titleAccent: 'home or investment',
  body: 'Questions & inquiries about buying, selling, or investing? Our team is here to provide guidance and help you take the next step.',
  backgroundImage:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=65',
  cardTitle: 'Looking for the right property?',
  cardBody:
    "Tell us what you're searching for and our team will help you explore opportunities & the best path forward.",
}

export const DEFAULT_ABOUT: AboutContent = {
  hero: {
    eyebrow: ABOUT_HERO.eyebrow,
    title: ABOUT_HERO.title,
    highlights: [...ABOUT_HERO.highlights],
    ctaLabel: ABOUT_HERO.ctaLabel,
    ctaHref: ABOUT_HERO.ctaHref,
    images: { ...ABOUT_HERO.images },
    statCard: { ...ABOUT_HERO.statCard },
  },
  story: {
    eyebrow: ABOUT_STORY.eyebrow,
    title: ABOUT_STORY.title,
    body: ABOUT_STORY.body,
    apartTitle: ABOUT_STORY.apartTitle,
    apartItems: [...ABOUT_STORY.apartItems],
    stats: ABOUT_STORY.stats.map((s) => ({ ...s })),
    images: { ...ABOUT_STORY.images },
  },
  video: { ...ABOUT_VIDEO },
  approach: {
    eyebrow: ABOUT_APPROACH.eyebrow,
    title: ABOUT_APPROACH.title,
    body: ABOUT_APPROACH.body,
    image: ABOUT_APPROACH.image,
    items: ABOUT_APPROACH.items.map((i) => ({ ...i })),
  },
  faqs: ABOUT_FAQS.map((f) => ({ ...f })),
}

export const DEFAULT_LIST_WITH_US: ListWithUsContent = structuredClone(LIST_WITH_US)

export const DEFAULT_HOME: HomeContent = {
  cta: {
    title: 'Have a property to list?',
    body: 'Tell us about your home and a Mojesu agent will reach out to schedule a valuation, for rent or for sale.',
    buttonLabel: 'Request a visit',
    buttonHref: '/list-with-us/',
  },
  carousels: {
    featured: {
      title: 'Featured deals',
      subtitle: 'Hand-picked listings from our team',
    },
    highDemand: {
      title: 'High demand in Kampala',
      subtitle: 'Most viewed and inquired about this week',
    },
    land: {
      title: 'Land for sale',
      subtitle: 'Plots across Kampala and surrounding districts',
    },
    popularRentals: {
      title: 'Popular rentals in mid-market areas',
      subtitle: 'Ntinda, Kira, Najjera, Naalya, Bukoto',
    },
    commercial: {
      title: 'Commercial spaces',
      subtitle: 'Offices, retail and warehouses — rent or buy',
    },
    exploreAreas: {
      title: 'Explore by area',
      subtitle: 'From prime addresses to emerging corridors',
    },
  },
  sections: {
    services: {
      eyebrow: 'Services',
      titleBefore: 'Guidance for every',
      titleAccent: 'property decision',
      body: 'From search and title checks to management and development — support that takes you from first viewing to ownership.',
    },
    reviews: {
      eyebrow: 'Testimonials',
      titleBefore: 'Trusted by buyers & investors',
      titleAccent: 'across the market',
      body: 'Hear from clients who found homes, secured deals, and hit their goals with Mojesu.',
    },
    agents: {
      eyebrow: 'our agents',
      titleBefore: 'Meet the experts',
      titleAccent: 'guiding every move',
      body: 'Our agents combine market knowledge, expertise & local insight to help clients find properties with confidence.',
    },
    insights: {
      eyebrow: 'Insights',
      titleBefore: 'Real estate insights for',
      titleAccent: 'smarter decisions',
      body: 'Explore market trends, buying strategies, and neighborhood insights to help you navigate the market with confidence.',
    },
  },
  indexPages: {
    services: {
      eyebrow: 'Services',
      title: 'Guidance for every property decision',
      body: 'From search and title checks to management and development — support that takes you from first viewing to ownership.',
    },
    insights: {
      eyebrow: 'Insights',
      title: 'Real estate insights for smarter decisions',
      body: 'Market updates, area guides, and practical advice for buying, renting, and investing in Kampala.',
    },
  },
}

export {
  DEFAULT_TAXONOMY,
  DEFAULT_AREAS,
  DEFAULT_VIEWING,
  DEFAULT_FORMS,
  DEFAULT_NAV,
}

export const SITE_CONTENT_DEFAULTS: SiteContentMap = {
  company: DEFAULT_COMPANY,
  contact: DEFAULT_CONTACT,
  about: DEFAULT_ABOUT,
  list_with_us: DEFAULT_LIST_WITH_US,
  home: DEFAULT_HOME,
  taxonomy: DEFAULT_TAXONOMY,
  areas: DEFAULT_AREAS,
  viewing: DEFAULT_VIEWING,
  forms: DEFAULT_FORMS,
  nav: DEFAULT_NAV,
}
