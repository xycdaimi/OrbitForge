import type { ArticleSource } from "./articles";
import { getPublishedArticles } from "./articles";
import { slugifyTag } from "./slugify-tag";

export type SeriesInfo = {
  name: string;
  slug: string;
  count: number;
};

export { slugifyTag as slugifySeries };

export function getAllSeries(
  articles: ArticleSource[] = getPublishedArticles(),
): SeriesInfo[] {
  const counts = new Map<string, SeriesInfo>();

  for (const article of articles) {
    const name = article.frontmatter.series?.trim();
    if (!name) {
      continue;
    }
    const slug = slugifyTag(name);
    const existing = counts.get(slug);
    if (existing) {
      existing.count += 1;
      continue;
    }
    counts.set(slug, { name, slug, count: 1 });
  }

  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getArticlesBySeriesSlug(
  seriesSlug: string,
  articles: ArticleSource[] = getPublishedArticles(),
): { series: SeriesInfo; articles: ArticleSource[] } | undefined {
  const series = getAllSeries(articles).find((item) => item.slug === seriesSlug);
  if (!series) {
    return undefined;
  }

  return {
    series,
    articles: articles.filter(
      (article) =>
        article.frontmatter.series &&
        slugifyTag(article.frontmatter.series) === seriesSlug,
    ),
  };
}
