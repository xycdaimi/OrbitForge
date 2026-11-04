import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-default bg-bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {siteConfig.name} · {siteConfig.nameZh}
          </p>
          <p className="mt-1 text-sm text-text-secondary">{siteConfig.sloganZh}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <Link href="/articles/" className="hover:text-accent-cyan">
            Articles
          </Link>
          <Link href="/projects/" className="hover:text-accent-cyan">
            Projects
          </Link>
          <Link href="/about/" className="hover:text-accent-cyan">
            About
          </Link>
          <span className="text-text-secondary/70">RSS 将在 SEO 模块提供</span>
        </div>
      </div>
      <div className="border-t border-border-default/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-text-secondary sm:px-6">
          © {year} {siteConfig.name}. License TBD.
        </p>
      </div>
    </footer>
  );
}
