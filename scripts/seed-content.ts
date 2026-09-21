/**
 * Seed insights, services, agents, reviews from scripts/seed-data into Supabase.
 *
 * Usage: pnpm seed:content
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { getSeedBlogPosts } from './seed-data/blog-catalog'
import { getSeedServices } from './seed-data/services-catalog'
import { getSeedAgents } from './seed-data/agents-catalog'
import { getSeedReviews } from './seed-data/reviews-catalog'

config({ path: '.env.local' })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const posts = getSeedBlogPosts()
  console.log(`Seeding ${posts.length} insights…`)
  for (const p of posts) {
    const { error } = await supabase.from('insight_posts').upsert(
      {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        description: p.description,
        cover_image: p.coverImage,
        category: p.category,
        read_time_minutes: p.readTimeMinutes,
        content: p.content,
        status: 'published',
        published_at: p.publishedAt,
      },
      { onConflict: 'slug' },
    )
    if (error) console.error(`  insight ${p.slug}:`, error.message)
    else console.log(`  published ${p.slug}`)
  }

  const services = getSeedServices()
  console.log(`Seeding ${services.length} services…`)
  for (let i = 0; i < services.length; i++) {
    const s = services[i]
    const { error } = await supabase.from('services').upsert(
      {
        service_key: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        hero_description: s.heroDescription,
        image: s.image,
        image_alt: s.imageAlt,
        icon_class: s.iconClass,
        enquiry: s.enquiry,
        what_we_do: s.whatWeDo,
        offerings: s.offerings,
        process: s.process,
        status: 'published',
        sort_order: i,
      },
      { onConflict: 'slug' },
    )
    if (error) console.error(`  service ${s.slug}:`, error.message)
    else console.log(`  published ${s.slug}`)
  }

  // Agents / reviews: clear + insert (no stable natural key besides name)
  console.log(`Seeding agents…`)
  await supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const agents = getSeedAgents()
  {
    const { error } = await supabase.from('agents').insert(
      agents.map((a, i) => ({
        name: a.name,
        role: a.role,
        photo_url: a.photoUrl,
        profile_href: a.profileHref ?? null,
        instagram_url: a.instagramUrl ?? null,
        linkedin_url: a.linkedinUrl ?? null,
        phone: a.phone ?? null,
        status: 'published',
        sort_order: i,
      })),
    )
    if (error) console.error('  agents:', error.message)
    else console.log(`  published ${agents.length} agents`)
  }

  console.log(`Seeding reviews…`)
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const reviews = getSeedReviews()
  {
    const { error } = await supabase.from('reviews').insert(
      reviews.map((r) => ({
        author_name: r.authorName,
        role: r.role,
        avatar_url: r.avatarUrl ?? null,
        photo_url: r.photoUrl,
        rating: r.rating,
        quote: r.quote,
        related_to: r.relatedTo,
        featured: Boolean(r.featured),
        status: 'published',
        review_date: r.createdAt,
      })),
    )
    if (error) console.error('  reviews:', error.message)
    else console.log(`  published ${reviews.length} reviews`)
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
