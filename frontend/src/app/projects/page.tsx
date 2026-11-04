import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { PageIntro } from "@/components/pages/PageIntro";
import { getPublishedProjects } from "@/lib/content/projects";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Projects"),
  description: "OrbitForge 开源项目与工程实验展示。",
};

export default function ProjectsPage() {
  const projects = getPublishedProjects();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <PageIntro
        eyebrowKey="projects.eyebrow"
        titleKey="projects.title"
        descriptionKey="projects.description"
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.frontmatter.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
