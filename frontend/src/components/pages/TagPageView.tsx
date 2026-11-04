"use client";

import Link from "next/link";
import { ArticleCard } from "@/components/cards/ArticleCard";
import type { ArticleSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type TagPageViewProps = {
  tagName: string;
  articles: ArticleSource[];
};

export function TagPageView({ tagName, articles }: TagPageViewProps) {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/articles/" className="hover:text-accent-cyan">
          {t("nav.articles")}
        </Link>
        <span className="mx-2">/</span>
        <span>{tagName}</span>
      </nav>
      <header className="mt-4">
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          {tagName}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tags.articlesCount", { n: articles.length })}
        </p>
      </header>
      <div className="mt-10 grid gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.frontmatter.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
