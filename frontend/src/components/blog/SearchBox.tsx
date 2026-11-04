"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SearchDocument } from "@/lib/search/documents";
import { searchDocuments } from "@/lib/search/engine";

type SearchBoxProps = {
  documents: SearchDocument[];
  initialQuery?: string;
};

export function SearchBox({ documents, initialQuery = "" }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const { t } = useLocale();
  const results = useMemo(
    () => searchDocuments(documents, query),
    [documents, query],
  );

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-sm text-text-secondary">{t("search.label")}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search.placeholder")}
          className="mt-2 w-full rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent-cyan"
          type="search"
          autoComplete="off"
        />
      </label>

      {!query.trim() ? (
        <p className="text-sm text-text-secondary">
          {t("search.hint", { n: documents.length })}
        </p>
      ) : results.length === 0 ? (
        <p className="rounded-xl border border-border-default bg-bg-surface/60 p-6 text-sm text-text-secondary">
          {t("search.empty", { query: query.trim() })}
        </p>
      ) : (
        <ul className="space-y-4">
          {results.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border-default bg-bg-surface/70 p-5"
            >
              <p className="text-xs text-text-secondary">
                {item.category} · {item.publishedAt}
              </p>
              <Link
                href={item.href}
                className="mt-2 block text-lg font-medium text-text-primary hover:text-accent-cyan"
              >
                {item.title}
              </Link>
              <p className="mt-2 text-sm text-text-secondary">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
