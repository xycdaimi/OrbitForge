import { describe, expect, it } from "vitest";
import { parseArticleSource } from "@/lib/content";
import { buildRssXml } from "./rss";

describe("buildRssXml", () => {
  it("includes published article entries", () => {
    const article = parseArticleSource(`---
title: "分布式任务"
slug: "distributed-task-execution"
description: "摘要 & 测试"
publishedAt: "2026-11-04"
status: "published"
category: "Architecture"
tags: ["Go"]
author: "site-owner"
---
body
`);

    const xml = buildRssXml([article]);
    expect(xml).toContain("<title>分布式任务</title>");
    expect(xml).toContain("/articles/distributed-task-execution/");
    expect(xml).toContain("摘要 &amp; 测试");
  });
});
