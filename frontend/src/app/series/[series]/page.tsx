import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesPageView } from "@/components/pages/SeriesPageView";
import {
  getAllSeries,
  getArticlesBySeriesSlug,
} from "@/lib/content/series";
import { getSiteTitle } from "@/lib/site";

type SeriesPageProps = {
  params: Promise<{ series: string }>;
};

export function generateStaticParams() {
  return getAllSeries().map((item) => ({ series: item.slug }));
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { series } = await params;
  const result = getArticlesBySeriesSlug(series);
  if (!result) {
    return { title: getSiteTitle("Series") };
  }
  return {
    title: getSiteTitle(result.series.name),
    description: `${result.series.name} · OrbitForge`,
  };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { series } = await params;
  const result = getArticlesBySeriesSlug(series);
  if (!result) {
    notFound();
  }

  return (
    <SeriesPageView
      seriesName={result.series.name}
      articles={result.articles}
    />
  );
}
