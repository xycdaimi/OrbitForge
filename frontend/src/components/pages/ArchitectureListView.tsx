"use client";

import Link from "next/link";
import { PageIntro } from "@/components/pages/PageIntro";
import type { ArchitectureSource } from "@/lib/content/types";

type ArchitectureListViewProps = {
  items: ArchitectureSource[];
};

export function ArchitectureListView({ items }: ArchitectureListViewProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <PageIntro
        eyebrowKey="architecture.eyebrow"
        titleKey="architecture.title"
        descriptionKey="architecture.description"
      />

      <div className="mt-10 grid gap-5">
        {items.map((item) => (
          <article
            key={item.frontmatter.slug}
            className="rounded-2xl border border-border-default bg-bg-surface/70 p-6"
          >
            <h2 className="text-xl font-semibold text-text-primary">
              <Link
                href={`/architecture/${item.frontmatter.slug}/`}
                className="hover:text-accent-cyan"
              >
                {item.frontmatter.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              {item.frontmatter.description}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
