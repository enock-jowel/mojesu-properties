import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InsightArticle } from '@/components/insight-article'
import { ArticleJsonLd } from '@/components/seo/article-json-ld'
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from '@/lib/blog'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: 'Insight — Mojesu' }

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/insights/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  }
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedBlogPosts(post.slug, 4)

  return (
    <main className="min-h-screen bg-background">
      <ArticleJsonLd post={post} />
      <SiteHeader />
      <InsightArticle post={post} related={related} />
      <SiteFooter />
    </main>
  )
}
