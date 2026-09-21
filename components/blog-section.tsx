import Link from 'next/link'
import {
  BLOG_CATEGORY_LABEL,
  type BlogPost,
} from '@/lib/blog'
import type { SectionIntro } from '@/lib/site-content/types'
import { CarouselSeeMoreCard } from '@/components/carousel-see-more-card'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import { sizedImageUrl } from '@/lib/media'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function BlogCard({ post }: { post: BlogPost }) {
  const href = `/insights/${post.slug}/`

  return (
    <article className="group w-full text-left">
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-alt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sizedImageUrl(post.coverImage, 720)}
            alt=""
            width={720}
            height={450}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-pill-soft-mid px-3 py-1 text-[11px] font-bold text-ink">
            {BLOG_CATEGORY_LABEL[post.category]}
          </span>
        </div>
        <div className="pt-3">
          <h3 className="line-clamp-2 text-[15.5px] font-bold leading-snug text-ink transition-colors group-hover:text-primary-dark">
            {post.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-muted">
            {post.excerpt}
          </p>
        </div>
      </Link>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-semibold text-neutral-muted">
          {post.readTimeMinutes} min read · {formatDate(post.publishedAt)}
        </p>
        <ArrowPillLink href={href} size="sm">
          Read more
        </ArrowPillLink>
      </div>
    </article>
  )
}

export function BlogSection({
  posts: postsProp,
  intro,
}: {
  posts: BlogPost[]
  intro: SectionIntro
}) {
  const posts = postsProp.slice(0, 4)
  const seeMorePreviews = posts.slice(0, 3).map((post) => ({
    url: post.coverImage,
    alt: post.title,
    title: post.title,
  }))

  return (
    <section
      id="blog"
      className="flex flex-col pt-4 pb-4 sm:pt-10 sm:pb-16"
      aria-labelledby="blog-heading"
    >
      <div className="site-container mb-6 flex flex-col items-center text-center sm:mb-8">
        <div className="mb-3 flex w-full max-w-sm items-center gap-3">
          <span
            className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/50"
            aria-hidden="true"
          />
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {intro.eyebrow}
          </p>
          <span
            className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/50"
            aria-hidden="true"
          />
        </div>

        <h2
          id="blog-heading"
          className="max-w-2xl text-balance text-2xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-3xl lg:text-[2.15rem]"
        >
          {intro.titleBefore}{' '}
          <span className="text-primary-dark">{intro.titleAccent}</span>
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-neutral-muted">
          {intro.body}
        </p>
      </div>

      {/* Mobile: one card + peek of next; extra gap so Read more isn’t cramped */}
      <div className="carousel-track-shell sm:hidden">
        <div className="carousel-track gap-5 pb-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="w-[calc(100%-2.75rem)] shrink-0 snap-start"
            >
              <BlogCard post={post} />
            </div>
          ))}
          <CarouselSeeMoreCard
            href="/insights/"
            label="See more insights"
            subtitle="Browse all articles"
            previews={seeMorePreviews}
            className="w-[calc(100%-2.75rem)] shrink-0 snap-start"
          />
        </div>
      </div>

      {/* Desktop: original grid */}
      <div className="site-container hidden sm:block">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {posts.slice(0, 3).map((post) => (
            <li key={post.id}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
