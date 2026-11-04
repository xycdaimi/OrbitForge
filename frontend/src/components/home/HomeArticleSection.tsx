import Link from "next/link";
import { ArticleCard } from "@/components/cards/ArticleCard";
import type { ArticleSource } from "@/lib/content";

type HomeArticleSectionProps = {
  title: string;
  eyebrow: string;
  articles: ArticleSource[];
  viewAllHref?: string;
};

export function HomeArticleSection({
  title,
  eyebrow,
  articles,
  viewAllHref = "/articles/",
}: HomeArticleSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="text-sm text-text-secondary hover:text-accent-cyan"
        >
          View all
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border-default bg-bg-surface/60 p-6 text-sm text-text-secondary">
          暂无文章。
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
