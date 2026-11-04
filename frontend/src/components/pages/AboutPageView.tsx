"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function AboutPageView() {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
          {t("about.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          {t("about.title")}
        </h1>
      </header>

      <div className="mt-8 space-y-6 text-base leading-8 text-text-secondary">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <div className="rounded-2xl border border-border-default bg-bg-surface/70 p-5 text-sm">
          <p className="font-medium text-accent-violet">
            {t("about.placeholderTitle")}
          </p>
          <p className="mt-2">{t("about.placeholderBody")}</p>
        </div>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">
            {t("about.focusTitle")}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>{t("about.focus1")}</li>
            <li>{t("about.focus2")}</li>
            <li>{t("about.focus3")}</li>
            <li>{t("about.focus4")}</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">
            {t("about.contactTitle")}
          </h2>
          <p className="mt-3">{t("about.contactBody")}</p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/articles/"
          className="rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-bg-primary"
        >
          {t("about.ctaArticles")}
        </Link>
        <Link
          href="/projects/"
          className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary hover:text-accent-cyan"
        >
          {t("about.ctaProjects")}
        </Link>
      </div>
    </main>
  );
}
