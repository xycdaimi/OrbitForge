import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/content";
import { getAllTags } from "@/lib/content/tags";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/articles/",
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

  return [...staticRoutes, ...articles, ...tags];
}
