import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/blog/MdxContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
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
  const { frontmatter, body, readingTime } = article;
  const jsonLd = buildArticleJsonLd(article);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="min-w-0">
          <nav className="text-sm text-text-secondary" aria-label="面包屑">
            <Link href="/" className="hover:text-accent-cyan">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/articles/" className="hover:text-accent-cyan">
              Articles
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{frontmatter.title}</span>
          </nav>

          <header className="mt-6 border-b border-border-default pb-8">
            <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
              <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-violet">
                {frontmatter.category}
              </span>
              <time dateTime={frontmatter.publishedAt}>
                {frontmatter.publishedAt}
              </time>
              {frontmatter.updatedAt ? (
                <span>更新于 {frontmatter.updatedAt}</span>
              ) : null}
              <span>{readingTime.minutes} min read</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {frontmatter.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
              {frontmatter.description}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-border-default px-2 py-1 text-xs text-text-secondary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </header>

          <div className="lg:hidden">
            <details className="my-6 rounded-xl border border-border-default bg-bg-surface/70 p-4">
              <summary className="cursor-pointer text-sm text-text-primary">
                目录
              </summary>
              <div className="mt-4">
                <TableOfContents items={toc} />
              </div>
            </details>
          </div>

          <div className="article-prose max-w-[48rem]">
            <MdxContent source={body} />
          </div>

          <nav
            className="mt-12 grid gap-4 border-t border-border-default pt-8 sm:grid-cols-2"
            aria-label="相邻文章"
          >
            {neighbors.previous ? (
              <Link
                href={`/articles/${neighbors.previous.frontmatter.slug}/`}
                className="rounded-xl border border-border-default bg-bg-surface/60 p-4 hover:border-accent-cyan/40"
              >
                <p className="text-xs text-text-secondary">上一篇</p>
                <p className="mt-2 text-sm text-text-primary">
                  {neighbors.previous.frontmatter.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {neighbors.next ? (
              <Link
                href={`/articles/${neighbors.next.frontmatter.slug}/`}
                className="rounded-xl border border-border-default bg-bg-surface/60 p-4 text-right hover:border-accent-cyan/40"
              >
                <p className="text-xs text-text-secondary">下一篇</p>
                <p className="mt-2 text-sm text-text-primary">
                  {neighbors.next.frontmatter.title}
                </p>
              </Link>
            ) : null}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </div>
    </main>
  );
}
