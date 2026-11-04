import type { Metadata } from "next";
import Link from "next/link";
import { getSiteTitle, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("About"),
  description: "关于 OrbitForge 星轨实验室。",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
          About
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          关于 {siteConfig.name}
        </h1>
      </header>

      <div className="mt-8 space-y-6 text-base leading-8 text-text-secondary">
        <p>
          <strong className="text-text-primary">{siteConfig.nameZh}</strong>{" "}
          是一个面向 AI 应用开发、模型训练、编程与系统架构的个人技术实验室。
        </p>
        <p>
          站点目标是同时做到两件事：首页有辨识度，文章页足够好读。公开内容以 Git +
          MDX 维护，动态能力按需交给 Go Lambda。
        </p>
        <div className="rounded-2xl border border-border-default bg-bg-surface/70 p-5 text-sm">
          <p className="font-medium text-accent-violet">占位说明</p>
          <p className="mt-2">
            以下个人简介、社交链接与肖像信息尚未提供真实内容，请勿当作已核实的个人履历。
          </p>
        </div>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">关注方向</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>AI Engineering / Agent 工作流</li>
            <li>分布式系统与 Serverless</li>
            <li>Go / TypeScript 工程实践</li>
            <li>模型训练实验记录</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">联系</h2>
          <p className="mt-3">
            GitHub 与邮件等公开联系方式待站点作者配置。当前导航中的 GitHub
            链接为占位地址。
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/articles/"
          className="rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-bg-primary"
        >
          阅读文章
        </Link>
        <Link
          href="/projects/"
          className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary hover:text-accent-cyan"
        >
          查看项目
        </Link>
      </div>
    </main>
  );
}
