import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { LabDetailChrome } from "@/components/lab/LabDetailChrome";
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
  const filePath = path.join(
    process.cwd(),
    "public",
    metricsPath.replace(/^\//, ""),
  );
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

  return <LabDetailChrome item={item} metrics={metrics} />;
}
