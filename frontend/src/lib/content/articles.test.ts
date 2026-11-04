import { describe, expect, it } from "vitest";
import {
  assertUniqueSlugs,
  getPublishedArticles,
  isPublicArticle,
  parseArticleSource,
} from "./articles";
import { estimateReadingTime } from "./reading-time";

const publishedRaw = `---
title: "分布式任务执行系统的设计与权衡"
slug: "distributed-task-execution"
description: "异步任务、资源隔离、可靠性与可观测性的设计实践。"
publishedAt: "2026-11-04"
updatedAt: "2026-11-04"
status: "published"
category: "Architecture"
tags: ["Go", "Distributed Systems", "Queue"]
series: "Engineering Architecture"
featured: true
author: "site-owner"
---

# 背景

这是一篇用于管线校验的示例文章正文。
`;

const draftRaw = `---
title: "草稿笔记"
slug: "draft-notes"
description: "不应出现在公开列表中。"
publishedAt: "2026-11-04"
status: "draft"
category: "Programming"
tags: ["TypeScript"]
author: "site-owner"
---

草稿正文。
`;

describe("parseArticleSource", () => {
  it("parses valid frontmatter and body", () => {
    const article = parseArticleSource(publishedRaw, {
      filepath: "sample.mdx",
    });

    expect(article.frontmatter.slug).toBe("distributed-task-execution");
    expect(article.frontmatter.featured).toBe(true);
    expect(article.body).toContain("示例文章正文");
    expect(article.readingTime.minutes).toBeGreaterThanOrEqual(1);
  });

  it("rejects invalid frontmatter", () => {
    const invalid = `---
title: ""
slug: "Bad_Slug"
description: "x"
publishedAt: "2026/11/04"
status: "published"
category: "Architecture"
tags: []
author: "site-owner"
---

body
`;

    expect(() => parseArticleSource(invalid, { filepath: "bad.mdx" })).toThrow(
      /Invalid frontmatter/,
    );
  });
});

describe("public article filtering", () => {
  it("hides drafts and future-dated articles", () => {
    const draft = parseArticleSource(draftRaw);
    const future = parseArticleSource(
      publishedRaw.replace('publishedAt: "2026-11-04"', 'publishedAt: "2099-01-01"'),
    );
    const now = new Date("2026-11-04T12:00:00.000Z");

    expect(isPublicArticle(draft, now)).toBe(false);
    expect(isPublicArticle(future, now)).toBe(false);
    expect(isPublicArticle(parseArticleSource(publishedRaw), now)).toBe(true);
  });

  it("detects duplicate slugs", () => {
    const a = parseArticleSource(publishedRaw, { filepath: "a.mdx" });
    const b = parseArticleSource(publishedRaw, { filepath: "b.mdx" });

    expect(() => assertUniqueSlugs([a, b])).toThrow(/Duplicate article slug/);
  });
});

describe("content fixtures on disk", () => {
  it("loads only published sample articles", () => {
    const published = getPublishedArticles(undefined, new Date("2026-11-04"));
    const slugs = published.map((article) => article.frontmatter.slug);

    expect(slugs).toContain("distributed-task-execution");
    expect(slugs).not.toContain("draft-notes");
  });
});

describe("estimateReadingTime", () => {
  it("returns at least one minute", () => {
    expect(estimateReadingTime("短文").minutes).toBe(1);
  });
});
