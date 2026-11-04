import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/content";
import { getPublishedArchitecture } from "@/lib/content/architecture";
import { getPublishedExperiments } from "@/lib/content/experiments";
import { getAllSeries } from "@/lib/content/series";
import { getAllTags } from "@/lib/content/tags";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/articles/",
    "/lab/",
    "/architecture/",
    "/projects/",
    "/about/",
    "/search/",
    "/rss.xml",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
  }));

  const articles = getPublishedArticles().map((article) => ({
    url: absoluteUrl(`/articles/${article.frontmatter.slug}/`),
    lastModified: new Date(
      article.frontmatter.updatedAt ?? article.frontmatter.publishedAt,
    ),
  }));

  const tags = getAllTags().map((tag) => ({
    url: absoluteUrl(`/tags/${tag.slug}/`),
    lastModified: new Date(),
  }));

  const series = getAllSeries().map((item) => ({
    url: absoluteUrl(`/series/${item.slug}/`),
    lastModified: new Date(),
  }));

  const labs = getPublishedExperiments().map((item) => ({
    url: absoluteUrl(`/lab/${item.frontmatter.slug}/`),
    lastModified: new Date(item.frontmatter.publishedAt),
  }));

  const architectures = getPublishedArchitecture().map((item) => ({
    url: absoluteUrl(`/architecture/${item.frontmatter.slug}/`),
    lastModified: new Date(item.frontmatter.publishedAt),
  }));

  return [
    ...staticRoutes,
    ...articles,
    ...tags,
    ...series,
    ...labs,
    ...architectures,
  ];
}
