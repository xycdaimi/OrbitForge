import { FocusBento } from "@/components/home/FocusBento";
import { HomeAboutTeaser } from "@/components/home/HomeAboutTeaser";
import { HomeArticleSection } from "@/components/home/HomeArticleSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeProjectsSection } from "@/components/home/HomeProjectsSection";
import { LabTerminal } from "@/components/home/LabTerminal";
import { getPublishedArticles } from "@/lib/content";
import { getPublishedProjects } from "@/lib/content/projects";

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
        titleKey="home.featuredTitle"
        articles={featured.length > 0 ? featured : latest.slice(0, 3)}
      />

      <HomeArticleSection titleKey="home.latestTitle" articles={latest} />

      <HomeProjectsSection projects={projects} />

      <LabTerminal />

      <HomeAboutTeaser />
    </main>
  );
}
