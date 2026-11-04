import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards/ProjectCard";
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
      <header className="max-w-3xl">
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          Projects
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">项目</h1>
        <p className="mt-3 text-base text-text-secondary">
          展示可公开的个人项目。标注为「示例」的条目仅用于验证页面与数据结构。
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.frontmatter.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
