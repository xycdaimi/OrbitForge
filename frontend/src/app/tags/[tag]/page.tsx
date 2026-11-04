import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { getAllTags, getArticlesByTagSlug } from "@/lib/content/tags";
import { getSiteTitle } from "@/lib/site";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const result = getArticlesByTagSlug(tag);
  if (!result) {
    return { title: getSiteTitle("Tag") };
  }
  return {
    title: getSiteTitle(`Tag: ${result.tag.name}`),
    description: `标记为 ${result.tag.name} 的 OrbitForge 文章。`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const result = getArticlesByTagSlug(tag);
  if (!result) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/articles/" className="hover:text-accent-cyan">
          Articles
        </Link>
        <span className="mx-2">/</span>
        <span>Tags</span>
      </nav>
      <header className="mt-4">
        <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
          Tag
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          {result.tag.name}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {result.articles.length} 篇文章
        </p>
      </header>
      <div className="mt-10 grid gap-5">
        {result.articles.map((article) => (
          <ArticleCard key={article.frontmatter.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
