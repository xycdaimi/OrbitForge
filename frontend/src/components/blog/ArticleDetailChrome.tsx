"use client";

import Link from "next/link";
import { ContentLocaleNotice } from "@/components/i18n/ContentLocaleNotice";
import { MdxContent } from "@/components/blog/MdxContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import type { ArticleSource, TocItem } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ArticleDetailChromeProps = {
  article: ArticleSource;
  toc: TocItem[];
  previous?: ArticleSource;
  next?: ArticleSource;
  jsonLd: Record<string, unknown>;
};

export function ArticleDetailChrome({
  article,
  toc,
  previous,
  next,
  jsonLd,
}: ArticleDetailChromeProps) {
  const { frontmatter, body, readingTime } = article;
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="min-w-0">
          <nav
            className="text-sm text-text-secondary"
            aria-label={t("articles.breadcrumb")}
          >
            <Link href="/" className="hover:text-accent-cyan">
              {t("nav.home")}
            </Link>
            <span className="mx-2">/</span>
            <Link href="/articles/" className="hover:text-accent-cyan">
              {t("nav.articles")}
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
                <span>
                  {t("articles.updated", { date: frontmatter.updatedAt })}
                </span>
              ) : null}
              <span>{t("articles.minRead", { n: readingTime.minutes })}</span>
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

          <div className="mt-6">
            <ContentLocaleNotice messageKey="articles.bodyNotice" />
          </div>

          <div className="lg:hidden">
            <details className="my-6 rounded-xl border border-border-default bg-bg-surface/70 p-4">
              <summary className="cursor-pointer text-sm text-text-primary">
                {t("articles.toc")}
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
            aria-label={t("articles.neighbors")}
          >
            {previous ? (
              <Link
                href={`/articles/${previous.frontmatter.slug}/`}
                className="rounded-xl border border-border-default bg-bg-surface/60 p-4 hover:border-accent-cyan/40"
              >
                <p className="text-xs text-text-secondary">{t("articles.prev")}</p>
                <p className="mt-2 text-sm text-text-primary">
                  {previous.frontmatter.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/articles/${next.frontmatter.slug}/`}
                className="rounded-xl border border-border-default bg-bg-surface/60 p-4 text-right hover:border-accent-cyan/40"
              >
                <p className="text-xs text-text-secondary">{t("articles.next")}</p>
                <p className="mt-2 text-sm text-text-primary">
                  {next.frontmatter.title}
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
