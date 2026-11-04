import type { ArticleSource } from "@/lib/content";
import { absoluteUrl, siteConfig } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildRssXml(articles: ArticleSource[]): string {
  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/articles/${article.frontmatter.slug}/`);
      return `    <item>
      <title>${escapeXml(article.frontmatter.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${new Date(article.frontmatter.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(article.frontmatter.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>
`;
}
