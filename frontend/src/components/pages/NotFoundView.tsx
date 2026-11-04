"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function NotFoundView() {
  const { t } = useLocale();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-6 py-24">
      <p className="text-sm tracking-[0.2em] text-accent-violet uppercase">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
        {t("notFound.title")}
      </h1>
      <p className="mt-4 max-w-xl text-base text-text-secondary">
        {t("notFound.body")}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-bg-primary"
        >
          {t("notFound.home")}
        </Link>
        <Link
          href="/articles/"
          className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary hover:border-accent-cyan/40 hover:text-accent-cyan"
        >
          {t("notFound.articles")}
        </Link>
      </div>
    </main>
  );
}
