import MiniSearch from "minisearch";
import type { SearchDocument } from "./documents";

export function createSearchEngine(documents: SearchDocument[]): MiniSearch {
  const engine = new MiniSearch<SearchDocument>({
    fields: ["title", "description", "tags", "category"],
    storeFields: [
      "title",
      "description",
      "tags",
      "category",
      "href",
      "publishedAt",
    ],
    searchOptions: {
      boost: { title: 3, tags: 2, description: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  engine.addAll(documents);
  return engine;
}

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
): SearchDocument[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const engine = createSearchEngine(documents);
  return engine.search(trimmed).map((result) => ({
    id: String(result.id),
    title: String(result.title),
    description: String(result.description),
    tags: String(result.tags),
    category: String(result.category),
    href: String(result.href),
    publishedAt: String(result.publishedAt),
  }));
}
