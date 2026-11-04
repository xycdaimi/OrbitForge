import type { ArticleSource } from "@/lib/content";
import { getPublishedArticles } from "@/lib/content";

export type SearchDocument = {
  id: string;
  title: string;
  description: string;
  tags: string;
  category: string;
  href: string;
  publishedAt: string;
};

export function toSearchDocument(article: ArticleSource): SearchDocument {
  return {
    id: article.frontmatter.slug,
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    tags: article.frontmatter.tags.join(" "),
    category: article.frontmatter.category,
    href: `/articles/${article.frontmatter.slug}/`,
    publishedAt: article.frontmatter.publishedAt,
  };
}

export function getSearchDocuments(
  articles: ArticleSource[] = getPublishedArticles(),
): SearchDocument[] {
  return articles.map(toSearchDocument);
}
