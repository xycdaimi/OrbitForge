"use client";

import Link from "next/link";
import { MdxContent } from "@/components/blog/MdxContent";
import { ContentLocaleNotice } from "@/components/i18n/ContentLocaleNotice";
import { MetricChart } from "@/components/lab/MetricChart";
import type { ExperimentSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type MetricsFile = {
  note: string;
  metric: string;
  points: Array<{ step: number; value: number }>;
};

type LabDetailChromeProps = {
  item: ExperimentSource;
  metrics: MetricsFile | null;
};

export function LabDetailChrome({ item, metrics }: LabDetailChromeProps) {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/lab/" className="hover:text-accent-cyan">
          {t("nav.lab")}
        </Link>
        <span className="mx-2">/</span>
        <span>{item.frontmatter.title}</span>
      </nav>

      <header className="mt-6 border-b border-border-default pb-8">
        {item.frontmatter.example ? (
          <p className="text-sm text-accent-violet">{t("lab.exampleNotice")}</p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          {item.frontmatter.title}
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          {item.frontmatter.description}
        </p>
        <dl className="mt-6 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
          <div>
            <dt className="text-text-primary">{t("lab.model")}</dt>
            <dd>{item.frontmatter.model ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-primary">{t("lab.framework")}</dt>
            <dd>{item.frontmatter.framework ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-primary">{t("lab.dataset")}</dt>
            <dd>{item.frontmatter.dataset ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-primary">{t("lab.hardware")}</dt>
            <dd>{item.frontmatter.hardware ?? "—"}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-6">
        <ContentLocaleNotice messageKey="lab.bodyNotice" />
      </div>

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
