import Link from 'next/link'
import {
  BLOG_CATEGORY_LABEL,
  type BlogContentBlock,
  type BlogPost,
} from '@/lib/blog'
import { BlogCard } from '@/components/blog-section'
import { CarouselSeeMoreCard } from '@/components/carousel-see-more-card'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Prefer an explicit lead; otherwise promote the first paragraph for answer-first GEO. */
function blocksWithLead(blocks: BlogContentBlock[]): BlogContentBlock[] {
  if (blocks.some((b) => b.type === 'lead')) return blocks
  const idx = blocks.findIndex((b) => b.type === 'p')
  if (idx < 0) return blocks
  const next = [...blocks]
  const first = next[idx]
  if (first.type !== 'p') return blocks
  next[idx] = { type: 'lead', text: first.text }
  return next
}

function ArticleBody({ blocks }: { blocks: BlogContentBlock[] }) {
  const resolved = blocksWithLead(blocks)
  return (
    <div className="flex w-full max-w-[800px] flex-col break-words [overflow-wrap:anywhere]">
      {resolved.map((block, i) => {
        if (block.type === 'lead') {
          return (
            <div
              key={i}
              className="mb-5 rounded-2xl border border-primary/15 bg-pill-soft px-4 py-4 sm:mb-6 sm:px-5 sm:py-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                Direct answer
              </p>
              <p className="mt-2 text-base font-semibold leading-relaxed text-ink sm:text-lg">
                {block.text}
              </p>
            </div>
          )
        }

        if (block.type === 'h2') {
          return (
            <h2
              key={i}
              className="mt-5 mb-2.5 text-lg font-extrabold tracking-tight text-ink first:mt-0 sm:mt-7 sm:mb-3 sm:text-xl"
            >
              {block.text}
            </h2>
          )
        }

        if (block.type === 'list') {
          return (
            <div key={i} className="mb-3 space-y-2.5 sm:mb-4">
              {block.intro ? (
                <p className="text-[15px] leading-relaxed text-ink sm:text-[15.5px]">
                  {block.intro}
                </p>
              ) : null}
              <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink sm:text-[15.5px]">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {block.outro ? (
                <p className="text-[15px] leading-relaxed text-ink sm:text-[15.5px]">
                  {block.outro}
                </p>
              ) : null}
            </div>
          )
        }

        return (
          <p
            key={i}
            className="mb-3 text-[15px] leading-relaxed text-ink sm:mb-3.5 sm:text-[15.5px]"
          >
            {block.text}
          </p>
        )
      })}
    </div>
  )
}

export function InsightArticle({
  post,
  related,
}: {
  post: BlogPost
  related: BlogPost[]
}) {
  const seeMorePreviews = related.slice(0, 3).map((item) => ({
    url: item.coverImage,
    alt: item.title,
    title: item.title,
  }))

  return (
    <article className="w-full max-w-full overflow-x-clip">
      {/* Title header — same gutters as site-container */}
      <header className="w-full max-w-full overflow-x-clip bg-surface-alt py-8 sm:py-12 lg:py-14">
        <div className="site-container">
          <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-3 text-center sm:gap-4">
            <nav
              aria-label="Breadcrumb"
              className="flex max-w-full flex-wrap items-center justify-center gap-1.5 text-[12px] font-medium tracking-wide text-ink/70"
            >
              <Link
                href="/insights/"
                className="transition-colors hover:text-ink"
              >
                All ARTICLES
              </Link>
              <span aria-hidden="true">&gt;</span>
              <span>POST</span>
            </nav>

            <div className="flex w-full max-w-full flex-col items-center gap-3 sm:gap-5">
              <h1 className="max-w-full text-balance text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl lg:text-[2.5rem] lg:leading-[1.15]">
                {post.title}
              </h1>

              <p className="max-w-[640px] text-pretty text-sm leading-relaxed text-neutral-muted sm:text-[15px]">
                {post.description}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
                <span className="rounded-[5px] bg-surface px-2.5 py-1 text-[12px] font-semibold text-neutral-muted shadow-sm ring-1 ring-black/[0.04]">
                  {BLOG_CATEGORY_LABEL[post.category]}
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="text-[13px] text-neutral-muted"
                >
                  Updated {formatDate(post.publishedAt)}
                </time>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero image + body */}
      <section className="w-full max-w-full overflow-x-clip py-6 sm:py-8 lg:py-10">
        <div className="site-container flex w-full flex-col items-center gap-6 sm:gap-8">
          <div className="relative aspect-[1.9/1] w-full max-w-[1300px] overflow-hidden rounded-[10px] bg-surface-alt">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full max-w-full object-cover"
              draggable={false}
            />
          </div>

          <ArticleBody blocks={post.content} />
        </div>
      </section>

      {/* More insights — same mobile carousel pattern as home */}
      {related.length > 0 ? (
        <section className="w-full max-w-full overflow-x-clip pb-10 pt-2 sm:pb-14 sm:pt-4">
          <div className="site-container mb-3 border-t border-black/[0.12] pt-6 sm:mb-4 sm:pt-8">
            <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              More insights
            </h2>
          </div>

          <div className="carousel-track-shell sm:hidden">
            <div className="carousel-track gap-5 pb-1">
              {related.map((item) => (
                <div
                  key={item.id}
                  className="w-[calc(100%-2.75rem)] shrink-0 snap-start"
                >
                  <BlogCard post={item} />
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

          <div className="site-container hidden sm:block">
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {related.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <BlogCard post={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  )
}
