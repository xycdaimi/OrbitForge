import { describe, expect, it } from "vitest";
import {
  getPublishedExperiments,
  parseExperimentSource,
} from "./experiments";

describe("experiments content", () => {
  it("parses experiment frontmatter", () => {
    const item = parseExperimentSource(`---
slug: "demo-loss-curve"
title: "Demo"
description: "d"
status: "published"
publishedAt: "2026-11-04"
example: true
---
body
`);
    expect(item.frontmatter.example).toBe(true);
  });

  it("loads published fixture", () => {
    expect(
      getPublishedExperiments().some(
        (item) => item.frontmatter.slug === "demo-loss-curve",
      ),
    ).toBe(true);
  });
});
