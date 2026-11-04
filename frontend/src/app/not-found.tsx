import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-6 py-24">
      <p className="text-sm tracking-[0.2em] text-accent-violet uppercase">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
        未找到该页面
      </h1>
      <p className="mt-4 max-w-xl text-base text-text-secondary">
        你访问的路径在 {siteConfig.name} 中不存在，或尚未发布。可以从首页继续探索技术文章与项目。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-bg-primary"
        >
          返回首页
        </Link>
        <Link
          href="/articles/"
          className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary hover:border-accent-cyan/40 hover:text-accent-cyan"
        >
          浏览文章
        </Link>
      </div>
    </main>
  );
}
