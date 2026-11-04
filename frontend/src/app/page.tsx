import Link from "next/link";
import { HomeArticleSection } from "@/components/home/HomeArticleSection";
import { HomeHero } from "@/components/home/HomeHero";
import { getPublishedArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const articles = getPublishedArticles();
  const featured = articles
    .filter((article) => article.frontmatter.featured)
    .slice(0, 3);
  const latest = articles.slice(0, 5);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
      <HomeHero />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "AI Engineering",
            body: "Agent、RAG、模型服务与推理优化。",
          },
          {
            title: "Model Training",
            body: "数据、训练过程、实验记录与失败分析。",
          },
          {
            title: "System Architecture",
            body: "分布式系统、Serverless 与设计权衡。",
          },
          {
            title: "Programming",
            body: "Go / TypeScript 工程实践与工具链。",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border-default bg-bg-surface/60 p-5"
          >
            <h2 className="text-base font-medium text-text-primary">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {item.body}
            </p>
          </div>
        ))}
      </section>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-default bg-bg-surface/60 p-6">
          <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
            Projects
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            开源与工程实验
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            展示可公开的个人项目、技术栈与设计亮点。完整项目页将随内容模块持续补充。
          </p>
          <Link
            href="/projects/"
            className="mt-6 inline-flex text-sm text-accent-cyan hover:underline"
          >
            前往 Projects
          </Link>
        </div>

        <div className="rounded-2xl border border-border-default bg-bg-surface/60 p-6">
          <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
            About
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            关于 {siteConfig.nameZh}
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            面向 AI 应用开发与系统架构的个人技术实验室。首页强调辨识度，文章页优先可读性。
          </p>
          <Link
            href="/about/"
            className="mt-6 inline-flex text-sm text-accent-cyan hover:underline"
          >
            了解更多
          </Link>
        </div>
      </section>
    </main>
  );
}
