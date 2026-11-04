import { describe, expect, it } from "vitest";
import { parseArticleSource } from "./articles";
import { getAllTags, getArticlesByTagSlug, slugifyTag } from "./tags";

describe("slugifyTag", () => {
  it("normalizes mixed tags", () => {
    expect(slugifyTag("Distributed Systems")).toBe("distributed-systems");
    expect(slugifyTag("Go")).toBe("go");
  });
});

describe("tag aggregation", () => {
  it("groups published articles by tag slug", () => {
    const articles = [
      parseArticleSource(`---
title: "A"
slug: "a"
description: "d"
publishedAt: "2026-11-04"
status: "published"
category: "Architecture"
tags: ["Go", "Distributed Systems"]
author: "site-owner"
---
body
`),
    ];

    expect(getAllTags(articles).map((tag) => tag.slug)).toEqual([
      "distributed-systems",
      "go",
    ]);
    expect(getArticlesByTagSlug("go", articles)?.articles).toHaveLength(1);
  });
});
