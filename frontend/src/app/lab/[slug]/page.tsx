import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/blog/MdxContent";
import { MetricChart } from "@/components/lab/MetricChart";
import {
  getExperimentBySlug,
  getPublishedExperiments,
} from "@/lib/content/experiments";
import { getSiteTitle } from "@/lib/site";

type LabDetailProps = {
  params: Promise<{ slug: string }>;
};

type MetricsFile = {
  note: string;
  metric: string;
  points: Array<{ step: number; value: number }>;
};

export function generateStaticParams() {
  return getPublishedExperiments().map((item) => ({
    slug: item.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: LabDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getExperimentBySlug(slug);
  if (!item) {
    return { title: getSiteTitle("Lab") };
  }
  return {
    title: getSiteTitle(item.frontmatter.title),
    description: item.frontmatter.description,
  };
}

function loadMetrics(metricsPath?: string): MetricsFile | null {
  if (!metricsPath || !metricsPath.startsWith("/data/")) {
    return null;
  }
  const filePath = path.join(process.cwd(), "public", metricsPath.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as MetricsFile;
}

export default async function LabDetailPage({ params }: LabDetailProps) {
  const { slug } = await params;
  const item = getExperimentBySlug(slug);
  if (!item) {
    notFound();
  }

  const metrics = loadMetrics(item.frontmatter.metricsPath);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/lab/" className="hover:text-accent-cyan">
          AI Lab
        </Link>
        <span className="mx-2">/</span>
        <span>{item.frontmatter.title}</span>
      </nav>

      <header className="mt-6 border-b border-border-default pb-8">
        {item.frontmatter.example ? (
          <p className="text-sm text-accent-violet">
            示例数据，非实测结果。
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          {item.frontmatter.title}
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          {item.frontmatter.description}
        </p>
        <dl className="mt-6 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
          <div>
            <dt className="text-text-primary">Model</dt>
            <dd>{item.frontmatter.model ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-primary">Framework</dt>
            <dd>{item.frontmatter.framework ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-primary">Dataset</dt>
            <dd>{item.frontmatter.dataset ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-primary">Hardware</dt>
            <dd>{item.frontmatter.hardware ?? "—"}</dd>
          </div>
        </dl>
      </header>

      {metrics ? (
        <div className="mt-8">
          <MetricChart
            title={metrics.metric}
            note={metrics.note}
            points={metrics.points}
          />
        </div>
      ) : null}

      <div className="mt-8">
        <MdxContent source={item.body} />
      </div>
    </main>
  );
}
