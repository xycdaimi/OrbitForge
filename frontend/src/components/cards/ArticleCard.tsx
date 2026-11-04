"use client";

import Link from "next/link";
import { CoverImage } from "@/components/blog/CoverImage";
import { slugifyTag } from "@/lib/content/slugify-tag";
import type { ArticleSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ArticleCardProps = {
  article: ArticleSource;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const { frontmatter, readingTime } = article;
  const { t } = useLocale();

  return (
    <article className="overflow-hidden rounded-2xl border border-border-default bg-bg-surface/70 transition-colors hover:border-accent-cyan/40">
      <CoverImage
        src={frontmatter.cover}
        alt={t("articles.coverAlt", { title: frontmatter.title })}
        className="h-40 w-full object-cover"
      />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-violet">
            {frontmatter.category}
          </span>
          {frontmatter.featured ? (
            <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-cyan">
              {t("articles.featured")}
            </span>
          ) : null}
          {frontmatter.series ? (
            <Link
              href={`/series/${slugifyTag(frontmatter.series)}/`}
              className="rounded-md border border-border-default px-2 py-1 hover:border-accent-cyan/40 hover:text-accent-cyan"
            >
              {frontmatter.series}
            </Link>
          ) : null}
          <time dateTime={frontmatter.publishedAt}>
            {frontmatter.publishedAt}
          </time>
          <span>{t("articles.minRead", { n: readingTime.minutes })}</span>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-text-primary">
          <Link
            href={`/articles/${frontmatter.slug}/`}
            className="hover:text-accent-cyan"
          >
            {frontmatter.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {frontmatter.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/tags/${slugifyTag(tag)}/`}
                className="rounded-md border border-border-default px-2 py-1 text-xs text-text-secondary hover:border-accent-cyan/40 hover:text-accent-cyan"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
