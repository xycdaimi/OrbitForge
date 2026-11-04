"use client";

import Link from "next/link";
import { StarfieldLazy } from "@/components/effects/StarfieldLazy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { siteConfig } from "@/lib/site";

const focusTagKeys = [
  "home.tag.ai",
  "home.tag.ml",
  "home.tag.distributed",
  "home.tag.architecture",
] as const;

export function HomeHero() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface/50 px-6 py-16 sm:px-10 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(57,217,245,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(144,107,250,0.12),transparent_35%),linear-gradient(180deg,rgba(16,30,50,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,54,76,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(34,54,76,0.35)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <StarfieldLazy />

      <div className="relative max-w-3xl">
        <p className="text-sm tracking-[0.22em] text-accent-cyan uppercase">
          {siteConfig.name}
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          {t("brand.slogan")}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
          {t("brand.description")}
        </p>

        <ul className="mt-8 flex flex-wrap gap-2">
          {focusTagKeys.map((key) => (
            <li
              key={key}
              className="rounded-md border border-border-default bg-bg-elevated/70 px-3 py-1 text-xs text-text-secondary"
            >
              {t(key)}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/articles/"
            className="rounded-lg bg-accent-cyan px-5 py-3 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-cyan/90"
          >
            {t("home.heroCtaArticles")}
          </Link>
          <Link
            href="/projects/"
            className="rounded-lg border border-border-default px-5 py-3 text-sm text-text-secondary transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan"
          >
            {t("home.heroCtaProjects")}
          </Link>
        </div>
      </div>
    </section>
  );
}
