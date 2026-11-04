import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailChrome } from "@/components/blog/ArticleDetailChrome";
import {
  extractToc,
  getArticleBySlug,
  getArticleNeighbors,
  getPublishedArticles,
} from "@/lib/content";
import { buildArticleJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, getSiteTitle } from "@/lib/site";
import "katex/dist/katex.min.css";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedArticles().map((article) => ({
    slug: article.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return { title: getSiteTitle("Not Found") };
  }

  return {
    title: getSiteTitle(article.frontmatter.title),
    description: article.frontmatter.description,
    alternates: {
      canonical: absoluteUrl(`/articles/${article.frontmatter.slug}/`),
    },
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      type: "article",
      url: absoluteUrl(`/articles/${article.frontmatter.slug}/`),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const toc = extractToc(article.body);
  const neighbors = getArticleNeighbors(getPublishedArticles(), slug);
  const jsonLd = buildArticleJsonLd(article);

  return (
    <ArticleDetailChrome
      article={article}
      toc={toc}
      previous={neighbors.previous}
      next={neighbors.next}
      jsonLd={jsonLd}
    />
  );
}
