import type { Metadata } from "next";
import { SearchBox } from "@/components/blog/SearchBox";
import { getSearchDocuments } from "@/lib/search/documents";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Search"),
  description: "搜索 OrbitForge 已发布的技术文章。",
};

export default function SearchPage() {
  const documents = getSearchDocuments();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          Search
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">搜索</h1>
      </header>
      <SearchBox documents={documents} />
    </main>
  );
}
