import type { BlogPost } from '@/lib/blog'

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mojesuproperties.com'
  )
}

export function ArticleJsonLd({ post }: { post: BlogPost }) {
  const origin = siteOrigin()
  const url = `${origin}/insights/${post.slug}/`
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Mojesu Properties International Ltd',
      url: origin,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mojesu Properties International Ltd',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/icon.png`,
      },
    },
    mainEntityOfPage: url,
    url,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
