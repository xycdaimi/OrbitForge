import { describe, expect, it } from "vitest";
import { getAllSeries, getArticlesBySeriesSlug, slugifySeries } from "./series";
import { parseArticleSource } from "./articles";

const sample = (slug: string, series?: string) =>
  parseArticleSource(`---
title: "T ${slug}"
slug: "${slug}"
description: "d"
publishedAt: "2026-11-04"
status: "published"
category: "Architecture"
tags: ["Go"]
${series ? `series: "${series}"` : ""}
author: "site-owner"
---

Body.
`);

describe("series", () => {
  it("slugifies and aggregates published series", () => {
    expect(slugifySeries("OrbitForge Engineering")).toBe("orbitforge-engineering");
    const articles = [
      sample("a", "OrbitForge Engineering"),
      sample("b", "OrbitForge Engineering"),
      sample("c"),
    ];
    const series = getAllSeries(articles);
    expect(series).toEqual([
      { name: "OrbitForge Engineering", slug: "orbitforge-engineering", count: 2 },
    ]);
    expect(getArticlesBySeriesSlug("orbitforge-engineering", articles)?.articles).toHaveLength(
      2,
    );
    expect(getArticlesBySeriesSlug("missing", articles)).toBeUndefined();
  });
});
