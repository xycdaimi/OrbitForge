import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertUniqueSlugAmongFiles,
  buildArticleScaffold,
  categoryToDir,
  parseNewArticleArgs,
  resolveArticlePath,
  slugifyTitle,
} from "./new-article-lib";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("new-article-lib", () => {
  it("parses CLI args with defaults", () => {
    expect(
      parseNewArticleArgs(["--title", "Hello World", "--category", "Architecture"]),
    ).toEqual({
      title: "Hello World",
      category: "Architecture",
      slug: undefined,
    });
    expect(parseNewArticleArgs(["--title", "Only Title"]).category).toBe(
      "Programming",
    );
  });

  it("slugifies latin titles and maps category dirs", () => {
    expect(slugifyTitle("Hello World!")).toBe("hello-world");
    expect(categoryToDir("System Architecture")).toBe("system-architecture");
    expect(
      resolveArticlePath("/tmp/articles", "Programming", "hello-world").replace(
        /\\/g,
        "/",
      ),
    ).toContain("/programming/hello-world.mdx");
  });

  it("rejects duplicate slugs", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "orbitforge-article-"));
    tempDirs.push(root);
    const dir = path.join(root, "programming");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "hello.mdx"),
      buildArticleScaffold({
        title: "Hello",
        slug: "hello-world",
        category: "Programming",
        publishedAt: "2026-11-04",
      }),
      "utf8",
    );

    expect(() => assertUniqueSlugAmongFiles(root, "hello-world")).toThrow(
      /slug 已存在/,
    );
    expect(() => assertUniqueSlugAmongFiles(root, "other-slug")).not.toThrow();
  });
});
