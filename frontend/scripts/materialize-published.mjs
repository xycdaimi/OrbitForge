import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
const dest = process.argv[3];
if (!source || !dest) {
  console.error("usage: materialize-published.mjs <published-export> <articles-dir>");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
if (!fs.existsSync(source)) {
  process.exit(0);
}

for (const slug of fs.readdirSync(source)) {
  const dir = path.join(source, slug);
  if (!fs.statSync(dir).isDirectory()) {
    continue;
  }
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "document.json"), "utf8"));
  const body = fs.readFileSync(path.join(dir, "body.md"), "utf8");
  const tags = (meta.tags ?? []).map((tag) => `"${tag}"`).join(", ");
  const mdx = `---
title: "${String(meta.title).replaceAll('"', '\\"')}"
slug: "${meta.slug}"
description: "${String(meta.description).replaceAll('"', '\\"')}"
publishedAt: "${String(meta.publishedAt ?? "").slice(0, 10)}"
status: "published"
category: "${meta.category}"
tags: [${tags}]
${meta.series ? `series: "${meta.series}"` : ""}
author: "site-owner"
---

${body}
`;
  const outDir = path.join(dest, "published");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${meta.slug}.mdx`), mdx, "utf8");
}
