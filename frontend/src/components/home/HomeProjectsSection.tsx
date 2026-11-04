"use client";

import Link from "next/link";
import { ProjectCard } from "@/components/cards/ProjectCard";
import type { ProjectSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type HomeProjectsSectionProps = {
  projects: ProjectSource[];
};

export function HomeProjectsSection({ projects }: HomeProjectsSectionProps) {
  const { t } = useLocale();

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            {t("home.projectsTitle")}
          </h2>
        </div>
        <Link
          href="/projects/"
          className="text-sm text-text-secondary hover:text-accent-cyan"
        >
          {t("home.viewAll")}
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.frontmatter.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
