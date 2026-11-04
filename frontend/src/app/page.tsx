import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-border-default bg-bg-surface/70 px-6 py-16 sm:px-10">
        <p className="text-sm tracking-[0.2em] text-accent-cyan uppercase">
          {siteConfig.nameZh}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg text-text-secondary">{siteConfig.slogan}</p>
        <p className="mt-2 text-base text-text-secondary">{siteConfig.sloganZh}</p>
        <p className="mt-8 max-w-2xl text-sm text-text-secondary">
          站点壳与设计 Token 已就绪。文章、搜索与完整首页信息架构将在后续模块接入。
        </p>
      </div>
    </main>
  );
}
