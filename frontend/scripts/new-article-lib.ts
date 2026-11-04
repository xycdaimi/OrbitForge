import fs from "node:fs";
import path from "node:path";

export type NewArticleArgs = {
  title: string;
  category: string;
  slug?: string;
};

export function parseNewArticleArgs(argv: string[]): NewArticleArgs {
  let title = "";
  let category = "Programming";
  let slug: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === "--title" && next) {
      title = next;
      i += 1;
      continue;
    }
    if (token === "--category" && next) {
      category = next;
      i += 1;
      continue;
    }
    if (token === "--slug" && next) {
      slug = next;
      i += 1;
    }
  }

  if (!title.trim()) {
    throw new Error('缺少 --title。示例：npm run new:article -- --title "我的文章"');
  }

  return { title: title.trim(), category: category.trim() || "Programming", slug };
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/[\u4e00-\u9fff]/g, (char) => {
      // Chinese titles without latin letters need an explicit --slug.
      void char;
      return "";
    })
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryToDir(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveArticlePath(
  articlesRoot: string,
  category: string,
  slug: string,
): string {
  const dir = categoryToDir(category) || "programming";
  return path.join(articlesRoot, dir, `${slug}.mdx`);
}

export function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMdxFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }
  return files;
}

export function extractSlugFromMdx(raw: string): string | undefined {
  const match = raw.match(/^---[\s\S]*?^slug:\s*["']?([^"'\n]+)["']?/m);
  return match?.[1]?.trim();
}

export function assertUniqueSlugAmongFiles(
  articlesRoot: string,
  slug: string,
): void {
  for (const file of walkMdxFiles(articlesRoot)) {
    const raw = fs.readFileSync(file, "utf8");
    const existing = extractSlugFromMdx(raw);
    if (existing === slug) {
      throw new Error(`slug 已存在：${slug}（${file}）`);
    }
  }
}

export function buildArticleScaffold(input: {
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
}): string {
  return `---
title: "${input.title.replaceAll('"', '\\"')}"
slug: "${input.slug}"
description: "在此填写一句话摘要。"
publishedAt: "${input.publishedAt}"
status: "draft"
category: "${input.category.replaceAll('"', '\\"')}"
tags: ["Draft"]
featured: false
author: "site-owner"
---

# ${input.title}

在此撰写正文。发布前将 \`status\` 改为 \`published\`。
`;
}
