"use client";

import { SearchBox } from "@/components/blog/SearchBox";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SearchDocument } from "@/lib/search/documents";

type SearchPageViewProps = {
  documents: SearchDocument[];
};

export function SearchPageView({ documents }: SearchPageViewProps) {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          {t("search.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          {t("search.title")}
        </h1>
      </header>
      <SearchBox documents={documents} />
    </main>
  );
}
