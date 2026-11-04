import type { ArticleSource } from "./articles";
import { getPublishedArticles } from "./articles";

export type TagInfo = {
  name: string;
  slug: string;
  count: number;
};

export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getAllTags(
  articles: ArticleSource[] = getPublishedArticles(),
): TagInfo[] {
  const counts = new Map<string, TagInfo>();

  for (const article of articles) {
    for (const tag of article.frontmatter.tags) {
      const slug = slugifyTag(tag);
      const existing = counts.get(slug);
      if (existing) {
        existing.count += 1;
        continue;
      }
      counts.set(slug, { name: tag, slug, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getArticlesByTagSlug(
  tagSlug: string,
  articles: ArticleSource[] = getPublishedArticles(),
): { tag: TagInfo; articles: ArticleSource[] } | undefined {
  const tag = getAllTags(articles).find((item) => item.slug === tagSlug);
  if (!tag) {
    return undefined;
  }

  return {
    tag,
    articles: articles.filter((article) =>
      article.frontmatter.tags.some((name) => slugifyTag(name) === tagSlug),
    ),
  };
}
