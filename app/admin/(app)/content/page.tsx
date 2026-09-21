import Link from 'next/link'
import {
  Building2,
  ClipboardList,
  FileText,
  Handshake,
  Home,
  Map,
  MapPinned,
  Menu,
  Tag,
  Star,
  Users,
  Wallet,
} from 'lucide-react'

const CATALOG = [
  {
    href: '/admin/content/insights/',
    title: 'Insights',
    body: 'Blog posts — title, cover, category, body blocks, publish.',
    icon: FileText,
  },
  {
    href: '/admin/content/services/',
    title: 'Services',
    body: 'Service offering pages with enquiry config and process steps.',
    icon: Handshake,
  },
  {
    href: '/admin/content/agents/',
    title: 'Agents',
    body: 'Team profiles shown on home and about.',
    icon: Users,
  },
  {
    href: '/admin/content/reviews/',
    title: 'Reviews',
    body: 'Testimonials for the reviews section.',
    icon: Star,
  },
] as const

const SITE_PAGES = [
  {
    href: '/admin/content/site/company/',
    title: 'Company & contact',
    body: 'Phone, email, address, socials, footer blurb, contact section copy.',
    icon: Building2,
  },
  {
    href: '/admin/content/site/about/',
    title: 'About page',
    body: 'Hero, story, video, approach cards, and FAQs.',
    icon: Users,
  },
  {
    href: '/admin/content/site/list-with-us/',
    title: 'List with us',
    body: 'Owner intake marketing page — hero, offerings, process.',
    icon: MapPinned,
  },
  {
    href: '/admin/content/site/home/',
    title: 'Home & marketing',
    body: 'CTA strip, carousel titles, section intros, index page shells.',
    icon: Home,
  },
  {
    href: '/admin/content/site/taxonomy/',
    title: 'Labels & kinds',
    body: 'Amenity names, property types, title status, search tab labels.',
    icon: Tag,
  },
  {
    href: '/admin/content/site/areas/',
    title: 'Area catalog',
    body: 'Neighborhoods, tiers, blurbs, and search placeholder.',
    icon: Map,
  },
  {
    href: '/admin/content/site/viewing/',
    title: 'Viewing fees',
    body: 'Pass price, property count, validity days, payment note.',
    icon: Wallet,
  },
  {
    href: '/admin/content/site/forms/',
    title: 'Form microcopy',
    body: 'Contact, list-with-us, and viewing booking labels & errors.',
    icon: ClipboardList,
  },
  {
    href: '/admin/content/site/nav/',
    title: 'Navigation',
    body: 'Header links, list CTA, footer columns and legal name.',
    icon: Menu,
  },
] as const

export const metadata = {
  title: 'Content — Mojesu Admin',
  robots: { index: false, follow: false },
}

function CardGrid({
  items,
}: {
  items: readonly {
    href: string
    title: string
    body: string
    icon: typeof FileText
  }[]
}) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {items.map((s) => {
        const Icon = s.icon
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex gap-3 rounded-2xl border border-neutral-light/80 bg-surface-alt/40 p-4 transition-colors hover:border-primary/40 hover:bg-pill-soft/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pill-soft text-primary">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-muted">
                  {s.body}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function AdminContentHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Content</h1>
      <p className="mt-1 text-sm text-neutral-muted">
        Catalog items and site-wide marketing copy officers edit most often.
      </p>

      <h2 className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-neutral-muted">
        Catalog
      </h2>
      <CardGrid items={CATALOG} />

      <h2 className="mt-10 text-xs font-bold uppercase tracking-[0.14em] text-neutral-muted">
        Site pages
      </h2>
      <CardGrid items={SITE_PAGES} />
    </div>
  )
}
