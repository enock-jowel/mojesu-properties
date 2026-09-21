import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  BLOG_CATEGORY_LABEL,
  getAllBlogPosts,
} from '@/lib/blog'
import { getHomeContent } from '@/lib/site-content/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Insights — Mojesu',
  description:
    'Market trends, buying strategies, and neighborhood guides for Kampala real estate.',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function InsightsIndexPage() {
  const [posts, home] = await Promise.all([
    getAllBlogPosts(),
    getHomeContent(),
  ])
  const shell = home.indexPages.insights

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <header className="bg-surface-alt px-4 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-4 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {shell.eyebrow}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {shell.title}
          </h1>
          <p className="max-w-[640px] text-pretty text-[15px] leading-relaxed text-neutral-muted sm:text-base">
            {shell.body}
          </p>
        </div>
      </header>

      <section className="site-container py-12 sm:py-16">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="group w-full">
                <Link
                  href={`/insights/${post.slug}/`}
                  className="block text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-alt">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-pill-soft-mid px-3 py-1 text-[11px] font-bold text-ink">
                      {BLOG_CATEGORY_LABEL[post.category]}
                    </span>
                  </div>
                  <div className="pt-3">
                    <h2 className="line-clamp-2 text-[15.5px] font-bold leading-snug text-ink transition-colors group-hover:text-primary-dark">
                      {post.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-muted">
                      {post.excerpt}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-neutral-muted">
                      {post.readTimeMinutes} min read ·{' '}
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  )
}
