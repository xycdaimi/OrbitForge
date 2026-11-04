import { describe, expect, it } from "vitest";
import { getPublishedProjects, parseProjectSource } from "./projects";

const validProject = `---
slug: "orbitforge-site"
title: "OrbitForge Site"
description: "示例：个人技术实验室静态站点骨架。"
stack: ["Next.js", "TypeScript", "Go"]
status: "experimental"
featured: true
publishedAt: "2026-11-04"
example: true
---

示例项目说明。
`;

describe("parseProjectSource", () => {
  it("parses valid project frontmatter", () => {
    const project = parseProjectSource(validProject);
    expect(project.frontmatter.slug).toBe("orbitforge-site");
    expect(project.frontmatter.example).toBe(true);
  });

  it("rejects invalid project frontmatter", () => {
    expect(() =>
      parseProjectSource(`---
slug: "Bad"
title: "x"
description: "d"
stack: []
status: "active"
publishedAt: "2026-11-04"
---
`),
    ).toThrow(/Invalid project frontmatter/);
  });
});

describe("getPublishedProjects", () => {
  it("loads example project from disk", () => {
    const projects = getPublishedProjects();
    expect(projects.some((item) => item.frontmatter.slug === "orbitforge-site")).toBe(
      true,
    );
  });
});
