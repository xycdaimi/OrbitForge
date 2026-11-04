"use client";

import Link from "next/link";
import { PageIntro } from "@/components/pages/PageIntro";
import type { ExperimentSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type LabListViewProps = {
  experiments: ExperimentSource[];
};

export function LabListView({ experiments }: LabListViewProps) {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <PageIntro
        eyebrowKey="lab.eyebrow"
        titleKey="lab.title"
        descriptionKey="lab.description"
        accent="violet"
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {experiments.map((item) => (
          <article
            key={item.frontmatter.slug}
            className="rounded-2xl border border-border-default bg-bg-surface/70 p-6"
          >
            <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
              {item.frontmatter.example ? (
                <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-violet">
                  {t("lab.example")}
                </span>
              ) : null}
              <time dateTime={item.frontmatter.publishedAt}>
                {item.frontmatter.publishedAt}
              </time>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-text-primary">
              <Link
                href={`/lab/${item.frontmatter.slug}/`}
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
