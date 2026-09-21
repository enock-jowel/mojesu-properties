/** Seed catalog for reviews — scripts/seed-content.ts only. */
import type { Review } from '../../lib/reviews'

/** African / Black portrait stock (Unsplash) — Kampala-facing review faces. */
const PORTRAIT = {
  amina:
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=640&q=70',
  daniel:
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=640&q=70',
  grace:
    'https://images.unsplash.com/photo-1508002366005-75a695ee2d17?auto=format&fit=crop&w=640&q=70',
  peter:
    'https://images.unsplash.com/photo-1616805765352-beedbad46b2a?auto=format&fit=crop&w=640&q=70',
  sarah:
    'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=640&q=70',
  james:
    'https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?auto=format&fit=crop&w=640&q=70',
  rebecca:
    'https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=640&q=70',
} as const

const REVIEWS: Review[] = [
  {
    id: 'r1',
    authorName: 'Amina Nakato',
    role: 'Homebuyer, Kololo',
    photoUrl: PORTRAIT.amina,
    rating: 5,
    quote:
      'Mojesu made the entire buying process smooth and transparent. Their market insight helped us secure the perfect home in a competitive neighbourhood.',
    relatedTo: 'purchase',
    createdAt: '2026-05-12',
    featured: true,
  },
  {
    id: 'r2',
    authorName: 'Daniel Okello',
    role: 'Home seller, Kira',
    photoUrl: PORTRAIT.daniel,
    avatarUrl: `${PORTRAIT.daniel.replace('w=640', 'w=128')}`,
    rating: 5,
    quote:
      'Professional and always responsive. Mojesu helped us sell our property quickly and at a great price.',
    relatedTo: 'purchase',
    createdAt: '2026-04-28',
  },
  {
    id: 'r3',
    authorName: 'Grace Mbabazi',
    role: 'Homebuyer, Ntinda',
    photoUrl: PORTRAIT.grace,
    avatarUrl: `${PORTRAIT.grace.replace('w=640', 'w=128')}`,
    rating: 5,
    quote:
      'From the first viewing to closing day, everything was handled with clarity and care. Highly recommended.',
    relatedTo: 'purchase',
    createdAt: '2026-06-02',
  },
  {
    id: 'r4',
    authorName: 'Peter Ssemwanga',
    role: 'Property investor',
    photoUrl: PORTRAIT.peter,
    rating: 5,
    quote:
      'The team understood exactly what we were looking for and guided us through every step. We couldn’t have asked for a better experience.',
    relatedTo: 'property-management',
    createdAt: '2026-03-18',
  },
  {
    id: 'r5',
    authorName: 'Sarah Atim',
    role: 'Real estate investor',
    photoUrl: PORTRAIT.sarah,
    rating: 5,
    quote:
      'Their local expertise and negotiation skills made a real difference. We found an incredible opportunity in Naalya.',
    relatedTo: 'valuation',
    createdAt: '2026-02-09',
  },
  {
    id: 'r6',
    authorName: 'James Mutebi',
    role: 'Renter, Bukoto',
    photoUrl: PORTRAIT.james,
    rating: 5,
    quote:
      'Found a clean apartment within days. The agent was clear on pricing and the move-in checklist saved us stress.',
    relatedTo: 'rental',
    createdAt: '2026-06-20',
  },
  {
    id: 'r7',
    authorName: 'Rebecca Namuli',
    role: 'Land buyer, Wakiso',
    photoUrl: PORTRAIT.rebecca,
    rating: 4,
    quote:
      'Title verification gave us peace of mind before we paid. Exactly the diligence we needed on a kibanja plot.',
    relatedTo: 'other',
    createdAt: '2026-05-30',
  },
]

export function getSeedReviews(): Review[] {
  return [...REVIEWS]
}
