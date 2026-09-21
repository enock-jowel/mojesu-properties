/** Seed catalog for agents — scripts/seed-content.ts only. */
import type { Agent } from '../../lib/agents'

const AGENTS: Agent[] = [
  {
    id: 'a1',
    name: 'Amina Nakato',
    role: 'Property Consultant',
    photoUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=70',
    profileHref: '#contact',
    instagramUrl: 'https://instagram.com',
    linkedinUrl: 'https://www.linkedin.com',
    phone: '+256700000001',
  },
  {
    id: 'a2',
    name: 'Daniel Okello',
    role: 'Sales Executive',
    photoUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=70',
    profileHref: '#contact',
    instagramUrl: 'https://instagram.com',
    linkedinUrl: 'https://www.linkedin.com',
    phone: '+256700000002',
  },
  {
    id: 'a3',
    name: 'Grace Mbabazi',
    role: 'Luxury Homes Specialist',
    photoUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=70',
    profileHref: '#contact',
    instagramUrl: 'https://instagram.com',
    linkedinUrl: 'https://www.linkedin.com',
    phone: '+256700000003',
  },
  {
    id: 'a4',
    name: 'Joseph Ssemwogerere',
    role: 'Land & Title Advisor',
    photoUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=70',
    profileHref: '#contact',
    linkedinUrl: 'https://www.linkedin.com',
    phone: '+256700000004',
  },
  {
    id: 'a5',
    name: 'Sarah Atim',
    role: 'Rental Specialist',
    photoUrl:
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=70',
    profileHref: '#contact',
    instagramUrl: 'https://instagram.com',
    linkedinUrl: 'https://www.linkedin.com',
    phone: '+256700000005',
  },
  {
    id: 'a6',
    name: 'Brian Kato',
    role: 'Commercial Advisor',
    photoUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=70',
    profileHref: '#contact',
    linkedinUrl: 'https://www.linkedin.com',
    phone: '+256700000006',
  },
]


export function getSeedAgents(): Agent[] {
  return [...AGENTS]
}
