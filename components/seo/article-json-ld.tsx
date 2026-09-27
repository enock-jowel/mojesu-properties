import type { BlogPost } from '@/lib/blog'
import { stripInlineLinks } from '@/components/inline-links'
import { breadcrumbList } from '@/components/seo/breadcrumb-json-ld'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export function ArticleJsonLd({ post }: { post: BlogPost }) {
  const origin = siteOrigin()
  const url = `${origin}/insights/${post.slug}/`

  const article = {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: 'en-UG',
    author: { '@id': `${origin}/#organization` },
    publisher: {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'Mojesu Properties International Ltd',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/icon.png`,
      },
    },
    mainEntityOfPage: url,
    url,
  }

  const faqs = post.content.flatMap((b) =>
    b.type === 'faq' ? b.items.filter((f) => f.q.trim() && f.a.trim()) : [],
  )
  const faqPage = faqs.length
    ? {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: stripInlineLinks(f.a) },
        })),
      }
    : null

  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Insights', path: '/insights/' },
        { name: post.title, path: `/insights/${post.slug}/` },
      ]),
      ...(faqPage ? [faqPage] : []),
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
