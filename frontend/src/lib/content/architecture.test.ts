import { describe, expect, it } from "vitest";
import {
  getPublishedArchitecture,
  parseArchitectureSource,
} from "./architecture";

describe("architecture content", () => {
  it("parses architecture frontmatter", () => {
    const item = parseArchitectureSource(`---
slug: "static-site-serverless-api"
title: "Demo"
description: "d"
status: "published"
publishedAt: "2026-11-04"
tags: ["CloudFront"]
---
body
`);
    expect(item.frontmatter.slug).toBe("static-site-serverless-api");
  });

  it("loads published fixture", () => {
    expect(
      getPublishedArchitecture().some(
        (item) => item.frontmatter.slug === "static-site-serverless-api",
      ),
    ).toBe(true);
  });
});
