import type {
  AboutApproachItem,
  AboutFaq,
  AboutHighlight,
} from '@/lib/about'
import type { ListWithUsContent } from '@/lib/list-with-us'
import type {
  AreasContent,
  FormsContent,
  NavContent,
  TaxonomyContent,
  ViewingContent,
} from '@/lib/site-content/catalog-types'

export type SiteContentKey =
  | 'company'
  | 'contact'
  | 'about'
  | 'list_with_us'
  | 'home'
  | 'taxonomy'
  | 'areas'
  | 'viewing'
  | 'forms'
  | 'nav'

export type {
  AreasContent,
  FormsContent,
  NavContent,
  TaxonomyContent,
  ViewingContent,
  SiteCatalog,
  LabelOption,
  NavLink,
} from '@/lib/site-content/catalog-types'

export type SocialLink = {
  label: string
  href: string
  iconClass: string
}

/** Single source of truth for phone / email / address / socials / footer. */
export type CompanyContent = {
  email: string
  phoneDisplay: string
  /** Digits with country code, e.g. 256780827159 */
  phoneTel: string
  address: string
  addressShort: string
  mapsHref: string
  footerBlurb: string
  socials: SocialLink[]
}

export type ContactContent = {
  eyebrow: string
  titleBefore: string
  titleAccent: string
  body: string
  backgroundImage: string
  cardTitle: string
  cardBody: string
}

export type AboutContent = {
  hero: {
    eyebrow: string
    title: string
    highlights: AboutHighlight[]
    ctaLabel: string
    ctaHref: string
    images: { primary: string; secondary: string }
    statCard: { value: string; label: string }
  }
  story: {
    eyebrow: string
    title: string
    body: string
    apartTitle: string
    apartItems: string[]
    stats: { value: string; label: string }[]
    images: { left: string; right: string }
  }
  video: {
    title: string
    image: string
    videoId: string
    videoUrl: string
  }
  approach: {
    eyebrow: string
    title: string
    body: string
    image: string
    items: AboutApproachItem[]
  }
  faqs: AboutFaq[]
}

export type SectionIntro = {
  eyebrow: string
  titleBefore: string
  titleAccent: string
  body: string
}

export type CarouselRowCopy = {
  title: string
  subtitle: string
}

export type HomeContent = {
  cta: {
    title: string
    body: string
    buttonLabel: string
    buttonHref: string
  }
  carousels: {
    featured: CarouselRowCopy
    highDemand: CarouselRowCopy
    land: CarouselRowCopy
    popularRentals: CarouselRowCopy
    commercial: CarouselRowCopy
    exploreAreas: CarouselRowCopy
  }
  sections: {
    services: SectionIntro
    reviews: SectionIntro
    agents: SectionIntro
    insights: SectionIntro
  }
  indexPages: {
    services: { eyebrow: string; title: string; body: string }
    insights: { eyebrow: string; title: string; body: string }
  }
}

export type { ListWithUsContent }

export type SiteContentMap = {
  company: CompanyContent
  contact: ContactContent
  about: AboutContent
  list_with_us: ListWithUsContent
  home: HomeContent
  taxonomy: TaxonomyContent
  areas: AreasContent
  viewing: ViewingContent
  forms: FormsContent
  nav: NavContent
}
