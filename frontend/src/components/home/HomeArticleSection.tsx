"use client";

import Link from "next/link";
import { ArticleCard } from "@/components/cards/ArticleCard";
import type { ArticleSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";

type HomeArticleSectionProps = {
  titleKey: MessageKey;
  articles: ArticleSource[];
  viewAllHref?: string;
};

export function HomeArticleSection({
  titleKey,
  articles,
  viewAllHref = "/articles/",
}: HomeArticleSectionProps) {
  const { t } = useLocale();

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">
            {t(titleKey)}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="text-sm text-text-secondary hover:text-accent-cyan"
        >
          {t("home.viewAll")}
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border-default bg-bg-surface/60 p-6 text-sm text-text-secondary">
          {t("home.emptyArticles")}
        </p>
      ) : (
        <div className="grid gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.frontmatter.slug} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
