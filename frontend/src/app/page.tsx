import Link from "next/link";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { FocusBento } from "@/components/home/FocusBento";
import { HomeArticleSection } from "@/components/home/HomeArticleSection";
import { HomeHero } from "@/components/home/HomeHero";
import { LabTerminal } from "@/components/home/LabTerminal";
import { getPublishedArticles } from "@/lib/content";
import { getPublishedProjects } from "@/lib/content/projects";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const articles = getPublishedArticles();
  const featured = articles
    .filter((article) => article.frontmatter.featured)
    .slice(0, 3);
  const latest = articles.slice(0, 5);
  const projects = getPublishedProjects()
    .filter((project) => project.frontmatter.featured)
    .slice(0, 2);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
      <HomeHero />
      <FocusBento />

      <HomeArticleSection
        eyebrow="Featured"
        title="精选文章"
        articles={featured.length > 0 ? featured : latest.slice(0, 3)}
      />

      <HomeArticleSection
        eyebrow="Latest"
        title="最近更新"
        articles={latest}
      />

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
              Projects
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-text-primary">
              开源与工程实验
            </h2>
          </div>
          <Link
            href="/projects/"
            className="text-sm text-text-secondary hover:text-accent-cyan"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.frontmatter.slug} project={project} />
          ))}
        </div>
      </section>

      <LabTerminal />

      <section className="rounded-2xl border border-border-default bg-bg-surface/60 p-6">
        <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
          About
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          关于 {siteConfig.nameZh}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
          面向 AI 应用开发与系统架构的个人技术实验室。首页强调辨识度，文章页优先可读性。
        </p>
        <Link
          href="/about/"
          className="mt-6 inline-flex text-sm text-accent-cyan hover:underline"
        >
          了解更多
        </Link>
      </section>
    </main>
  );
}
