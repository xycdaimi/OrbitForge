import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchitectureDetailChrome } from "@/components/architecture/ArchitectureDetailChrome";
import {
  getArchitectureBySlug,
  getPublishedArchitecture,
} from "@/lib/content/architecture";
import { getSiteTitle } from "@/lib/site";

type ArchitectureDetailProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedArchitecture().map((item) => ({
    slug: item.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArchitectureDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getArchitectureBySlug(slug);
  if (!item) {
    return { title: getSiteTitle("Architecture") };
  }
  return {
    title: getSiteTitle(item.frontmatter.title),
    description: item.frontmatter.description,
  };
}

export default async function ArchitectureDetailPage({
  params,
}: ArchitectureDetailProps) {
  const { slug } = await params;
  const item = getArchitectureBySlug(slug);
  if (!item) {
    notFound();
  }

  return <ArchitectureDetailChrome item={item} />;
}
