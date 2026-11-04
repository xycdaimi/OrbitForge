"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function HomeAboutTeaser() {
  const { t } = useLocale();

  return (
    <section className="rounded-2xl border border-border-default bg-bg-surface/60 p-6">
      <h2 className="text-2xl font-semibold text-text-primary">
        {t("home.aboutTitle")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
        {t("home.aboutBody")}
      </p>
      <Link
        href="/about/"
        className="mt-6 inline-flex text-sm text-accent-cyan hover:underline"
      >
        {t("home.aboutCta")}
      </Link>
    </section>
  );
}
