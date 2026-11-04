"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchDocument } from "@/lib/search/documents";
import { searchDocuments } from "@/lib/search/engine";

type SearchBoxProps = {
  documents: SearchDocument[];
  initialQuery?: string;
};

export function SearchBox({ documents, initialQuery = "" }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(
    () => searchDocuments(documents, query),
    [documents, query],
  );

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-sm text-text-secondary">搜索文章</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="标题、摘要或标签…"
          className="mt-2 w-full rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent-cyan"
          type="search"
          autoComplete="off"
        />
      </label>

      {!query.trim() ? (
        <p className="text-sm text-text-secondary">
          输入关键词开始检索。当前索引包含 {documents.length} 篇已发布文章。
        </p>
      ) : results.length === 0 ? (
        <p className="rounded-xl border border-border-default bg-bg-surface/60 p-6 text-sm text-text-secondary">
          没有匹配「{query.trim()}」的文章。
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
