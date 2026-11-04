import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedExperiments } from "@/lib/content/experiments";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("AI Lab"),
  description: "OrbitForge 实验记录与示例可视化。",
};

export default function LabPage() {
  const experiments = getPublishedExperiments();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
          AI Lab
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">实验室</h1>
        <p className="mt-3 text-base text-text-secondary">
          展示可复现实验记录。当前条目含明确标注的示例数据，不代表在线 GPU 服务。
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {experiments.map((item) => (
          <article
            key={item.frontmatter.slug}
            className="rounded-2xl border border-border-default bg-bg-surface/70 p-6"
          >
            <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
              {item.frontmatter.example ? (
                <span className="rounded-md bg-bg-elevated px-2 py-1 text-accent-violet">
                  示例数据
                </span>
              ) : null}
              <time dateTime={item.frontmatter.publishedAt}>
                {item.frontmatter.publishedAt}
              </time>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-text-primary">
              <Link
                href={`/lab/${item.frontmatter.slug}/`}
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
