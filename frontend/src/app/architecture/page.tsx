import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArchitecture } from "@/lib/content/architecture";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Architecture"),
  description: "OrbitForge 架构设计与部署边界说明。",
};

export default function ArchitecturePage() {
  const items = getPublishedArchitecture();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          Architecture
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">架构</h1>
        <p className="mt-3 text-base text-text-secondary">
          记录系统设计取舍。图表提供 Mermaid 与文字说明，避免只剩不可访问的视觉。
        </p>
      </header>

      <div className="mt-10 grid gap-5">
        {items.map((item) => (
          <article
            key={item.frontmatter.slug}
            className="rounded-2xl border border-border-default bg-bg-surface/70 p-6"
          >
            <h2 className="text-xl font-semibold text-text-primary">
              <Link
                href={`/architecture/${item.frontmatter.slug}/`}
                className="hover:text-accent-cyan"
              >
                {item.frontmatter.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              {item.frontmatter.description}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
