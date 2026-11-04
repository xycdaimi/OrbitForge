"use client";

import type { ProjectSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ProjectCardProps = {
  project: ProjectSource;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { frontmatter } = project;
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-border-default bg-bg-surface/70 p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-cyan uppercase">
          {frontmatter.status}
        </span>
        {frontmatter.example ? (
          <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-violet">
            {t("projects.example")}
          </span>
        ) : null}
        <time dateTime={frontmatter.publishedAt}>{frontmatter.publishedAt}</time>
      </div>
      <h2 className="mt-3 text-xl font-semibold text-text-primary">
        {frontmatter.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-text-secondary">
        {frontmatter.description}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {frontmatter.stack.map((item) => (
          <li
            key={item}
            className="rounded-md border border-border-default px-2 py-1 text-xs text-text-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        {frontmatter.repoUrl ? (
          <a
            href={frontmatter.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline"
          >
            {t("nav.github")}
          </a>
        ) : null}
        {frontmatter.demoUrl ? (
          <a
            href={frontmatter.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline"
          >
            Demo
          </a>
        ) : null}
      </div>
    </article>
  );
}
