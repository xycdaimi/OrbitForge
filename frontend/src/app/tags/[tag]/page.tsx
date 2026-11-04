import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TagPageView } from "@/components/pages/TagPageView";
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
    <TagPageView tagName={result.tag.name} articles={result.articles} />
  );
}
