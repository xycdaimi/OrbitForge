import type { Metadata } from "next";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { getPublishedArticles } from "@/lib/content";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Articles"),
  description: "OrbitForge 技术文章列表：架构、工程实践与 AI 应用。",
};

export default function ArticlesPage() {
  const articles = getPublishedArticles();
  const featured = articles.filter((article) => article.frontmatter.featured);
  const rest = articles.filter((article) => !article.frontmatter.featured);
  const ordered = [...featured, ...rest];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          Articles
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
          技术文章
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          记录 AI Engineering、系统架构与工程实践中的设计取舍。
        </p>
      </header>

      {ordered.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-border-default bg-bg-surface/60 p-8 text-text-secondary">
          暂无已发布文章。
        </p>
      ) : (
        <div className="mt-10 grid gap-5">
          {ordered.map((article) => (
            <ArticleCard key={article.frontmatter.slug} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
