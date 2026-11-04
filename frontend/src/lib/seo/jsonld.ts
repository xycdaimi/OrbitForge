import type { ArticleSource } from "@/lib/content";
import { absoluteUrl, siteConfig } from "@/lib/site";

export function buildArticleJsonLd(article: ArticleSource) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.frontmatter.title,
    description: article.frontmatter.description,
    datePublished: article.frontmatter.publishedAt,
    dateModified:
      article.frontmatter.updatedAt ?? article.frontmatter.publishedAt,
    author: {
      "@type": "Person",
      name: article.frontmatter.author,
    },
    mainEntityOfPage: absoluteUrl(`/articles/${article.frontmatter.slug}/`),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}
