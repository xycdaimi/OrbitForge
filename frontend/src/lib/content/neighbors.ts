import type { ArticleSource } from "./articles";

export type ArticleNeighbors = {
  previous?: ArticleSource;
  next?: ArticleSource;
};

export function getArticleNeighbors(
  articles: ArticleSource[],
  slug: string,
): ArticleNeighbors {
  const index = articles.findIndex(
    (article) => article.frontmatter.slug === slug,
  );

  if (index < 0) {
    return {};
  }

  return {
    previous: articles[index + 1],
    next: articles[index - 1],
  };
}
