/**
 * Seed catalog for insights — used only by scripts/seed-content.ts.
 */
import type { BlogPost } from '../../lib/blog'

const POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Kampala rental yields in mid-market suburbs, mid-2026',
    excerpt:
      'Where Ntinda, Kira and Najjera sit on net yield — and what landlords should watch this quarter.',
    description:
      'Learn how rents, vacancy, and maintenance costs shape net yield across Ntinda, Kira, and Najjera — and what landlords should watch this quarter.',
    coverImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=70',
    category: 'market-update',
    readTimeMinutes: 6,
    publishedAt: '2026-07-08',
    slug: 'kampala-rental-yields-mid-2026',
    content: [
      {
        type: 'lead',
        text: 'Mid-market Kampala suburbs continue to attract both tenants and landlords. Understanding net yield — not just asking rent — is what separates steady income from surprise costs.',
      },
      {
        type: 'p',
        text: 'Gross rent looks healthy in several corridors, but service charges, downtime between tenants, and light renovations can compress returns. Landlords who price against recent leases — not wishful asking prices — are filling units faster.',
      },
      {
        type: 'h2',
        text: 'Start With Comparable Leases',
      },
      {
        type: 'p',
        text: 'Pricing is the most important decision you make. Overpricing extends vacancy. Underpricing fills quickly but leaves money on the table.',
      },
      {
        type: 'list',
        intro: 'Review recent leases in the same estate or road. Focus on:',
        items: [
          'Actual achieved rent (not asking)',
          'Days vacant between tenants',
          'Unit condition and finishing differences',
        ],
        outro: 'Accurate pricing builds momentum early.',
      },
      {
        type: 'h2',
        text: 'Account For Real Operating Costs',
      },
      {
        type: 'p',
        text: 'Small visible issues create unnecessary doubt for tenants and drag on net yield. Budget for paint, fixtures, and minor repairs between lets.',
      },
      {
        type: 'list',
        intro: 'Prioritize:',
        items: [
          'Fixing leaks and plumbing niggles',
          'Repainting scuffed walls',
          'Replacing tired lighting',
          'Clear service-charge expectations',
        ],
        outro:
          'Well-maintained units feel move-in ready and support stronger, steadier rents.',
      },
      {
        type: 'h2',
        text: 'Ntinda, Kira, And Najjera At A Glance',
      },
      {
        type: 'p',
        text: 'Ntinda remains liquid for 2–3 bedroom apartments near workplaces. Kira offers more house-style stock with slightly longer fill times. Najjera continues to draw families trading space for a manageable commute.',
      },
      {
        type: 'h2',
        text: 'Final Thoughts',
      },
      {
        type: 'p',
        text: 'Strong rental returns in Kampala come from disciplined pricing, low vacancy, and honest cost tracking. Treat yield as a system — not a single rent figure — and mid-market suburbs remain a durable place to invest.',
      },
    ],
  },
  {
    id: 'b2',
    title: 'A buyer’s guide to Kibanja vs freehold in Greater Kampala',
    excerpt:
      'How tenure types affect financing, resale and risk — plain language for first-time buyers.',
    description:
      'Understand how Kibanja and freehold differ on financing, resale, and risk — so you can buy in Greater Kampala with clearer eyes.',
    coverImage:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=70',
    category: 'legal-title',
    readTimeMinutes: 8,
    publishedAt: '2026-06-22',
    slug: 'kibanja-vs-freehold-kampala',
    content: [
      {
        type: 'lead',
        text: 'Tenure is not paperwork trivia. In Greater Kampala, whether you buy Kibanja or freehold shapes financing options, resale liquidity, and how carefully you must verify rights before you pay.',
      },
      {
        type: 'p',
        text: 'First-time buyers often hear both terms used loosely. Treat them as different risk profiles — then match the plot to your timeline, budget, and lender expectations.',
      },
      {
        type: 'h2',
        text: 'What Freehold Typically Means',
      },
      {
        type: 'p',
        text: 'Freehold generally offers the clearest ownership story for lenders and future buyers. Title verification still matters — forged or overlapping claims are not unheard of — but the pathway is usually more familiar to banks.',
      },
      {
        type: 'h2',
        text: 'What Kibanja Buyers Must Verify',
      },
      {
        type: 'list',
        intro: 'Before you commit, insist on diligence around:',
        items: [
          'Landlord / mailo interest and consent trail',
          'Boundary survey against what you were shown',
          'Occupancy history and competing claims',
          'What your bank will (and will not) finance',
        ],
        outro:
          'Skipping verification to “save time” is how deposits become disputes.',
      },
      {
        type: 'h2',
        text: 'Financing And Resale',
      },
      {
        type: 'p',
        text: 'Some products and buyers prefer freehold for simplicity. Kibanja can still be a sound purchase when documentation is strong and price reflects the risk — but expect a narrower buyer pool when you eventually sell.',
      },
      {
        type: 'h2',
        text: 'Final Thoughts',
      },
      {
        type: 'p',
        text: 'Choose tenure with your exit in mind. A clean freehold may cost more today and sell faster tomorrow. A well-verified Kibanja can unlock location and price — if you do the diligence first.',
      },
    ],
  },
  {
    id: 'b3',
    title: 'Why Naalya keeps showing up on family shortlists',
    excerpt:
      'Schools, malls and commute trade-offs — a practical area guide before you book viewings.',
    description:
      'Schools, malls, and commute trade-offs — a practical look at why Naalya stays on family shortlists before you book viewings.',
    coverImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70',
    category: 'area-guide',
    readTimeMinutes: 5,
    publishedAt: '2026-06-10',
    slug: 'naalya-area-guide-families',
    content: [
      {
        type: 'lead',
        text: 'Naalya keeps earning a place on family shortlists because it balances space, amenities, and a workable commute — without the full premium of prime Kampala addresses.',
      },
      {
        type: 'p',
        text: 'Families rarely choose on price alone. They weigh school runs, weekend errands, and whether evenings feel manageable after traffic. Naalya scores well on that checklist for many households.',
      },
      {
        type: 'h2',
        text: 'What Families Optimise For',
      },
      {
        type: 'list',
        intro: 'Most shortlists converge on:',
        items: [
          'Access to schools and after-school routines',
          'Retail and services without a long detour',
          'Housing stock with outdoor or parking space',
          'Commute predictability into central Kampala',
        ],
      },
      {
        type: 'h2',
        text: 'Trade-Offs To Expect',
      },
      {
        type: 'p',
        text: 'Peak-hour traffic still matters. Some pockets feel quieter than others. Stock quality varies estate to estate — so visit at the hour you would actually live there, not only at midday.',
      },
      {
        type: 'h2',
        text: 'How To Use Viewings',
      },
      {
        type: 'p',
        text: 'Book two or three homes in one corridor on the same day. Compare noise, access roads, and finishing side by side. Bring your real commute time into the decision — not the map’s optimistic estimate.',
      },
      {
        type: 'h2',
        text: 'Final Thoughts',
      },
      {
        type: 'p',
        text: 'Naalya is popular for practical reasons. If your household values space and amenities over a central address, it deserves a serious look — with eyes open to traffic and estate-level differences.',
      },
    ],
  },
]


export function getSeedBlogPosts(): BlogPost[] {
  return [...POSTS]
}
