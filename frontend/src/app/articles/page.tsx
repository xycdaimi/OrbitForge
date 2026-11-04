import type { Metadata } from "next";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { PageIntro } from "@/components/pages/PageIntro";
import { ArticlesEmpty } from "@/components/pages/ArticlesEmpty";
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
      <PageIntro
        eyebrowKey="articles.eyebrow"
        titleKey="articles.title"
        descriptionKey="articles.description"
      />

      {ordered.length === 0 ? (
        <ArticlesEmpty />
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
