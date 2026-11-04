import type { Metadata } from "next";
import { SearchPageView } from "@/components/pages/SearchPageView";
import { getSearchDocuments } from "@/lib/search/documents";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Search"),
  description: "搜索 OrbitForge 已发布的技术文章。",
};

export default function SearchPage() {
  return <SearchPageView documents={getSearchDocuments()} />;
}
