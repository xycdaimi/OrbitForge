import { describe, expect, it } from "vitest";
import type { SearchDocument } from "./documents";
import { searchDocuments } from "./engine";

const documents: SearchDocument[] = [
  {
    id: "distributed-task-execution",
    title: "分布式任务执行系统的设计与权衡",
    description: "异步任务与队列",
    tags: "Go Distributed Systems Queue",
    category: "Architecture",
    href: "/articles/distributed-task-execution/",
    publishedAt: "2026-11-04",
  },
];

describe("searchDocuments", () => {
  it("finds articles by tag-like terms", () => {
    const results = searchDocuments(documents, "Go");
    expect(results[0]?.id).toBe("distributed-task-execution");
  });

  it("returns empty for blank queries", () => {
    expect(searchDocuments(documents, "   ")).toEqual([]);
  });
});
