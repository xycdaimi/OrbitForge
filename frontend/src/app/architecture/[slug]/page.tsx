import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/blog/MdxContent";
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/architecture/" className="hover:text-accent-cyan">
          Architecture
        </Link>
        <span className="mx-2">/</span>
        <span>{item.frontmatter.title}</span>
      </nav>
      <header className="mt-6 border-b border-border-default pb-8">
        <h1 className="text-3xl font-semibold text-text-primary">
          {item.frontmatter.title}
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          {item.frontmatter.description}
        </p>
      </header>
      <div className="mt-8">
        <MdxContent source={item.body} />
      </div>
    </main>
  );
}
