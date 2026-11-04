import { describe, expect, it } from "vitest";
import { parseArticleSource } from "./articles";
import { getArticleNeighbors } from "./neighbors";

function article(slug: string, publishedAt: string) {
  return parseArticleSource(`---
title: "${slug}"
slug: "${slug}"
description: "d"
publishedAt: "${publishedAt}"
status: "published"
category: "Architecture"
tags: ["Go"]
author: "site-owner"
---

body
`);
}

describe("getArticleNeighbors", () => {
  it("returns previous and next relative to newest-first order", () => {
    const articles = [
      article("newer", "2026-11-04"),
      article("middle", "2026-11-03"),
      article("older", "2026-11-02"),
    ];

    expect(getArticleNeighbors(articles, "middle")).toEqual({
      previous: articles[2],
      next: articles[0],
    });
  });
});
