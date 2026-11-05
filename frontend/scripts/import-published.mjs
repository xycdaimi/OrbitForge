import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const articlesDir = process.argv[2];
const outDir = process.argv[3];
if (!articlesDir || !outDir) {
  console.error("usage: import-published.mjs <articles-dir> <export-dir>");
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return null;
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\r?\n/, "");
  const meta = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      meta[key] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      meta[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { meta, body };
}

let count = 0;
for (const file of walk(articlesDir)) {
  const parsed = parseFrontmatter(fs.readFileSync(file, "utf8"));
  if (!parsed || parsed.meta.status !== "published" || !parsed.meta.slug) continue;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const doc = {
    id,
    slug: parsed.meta.slug,
    title: parsed.meta.title ?? "",
    description: parsed.meta.description ?? "",
    status: "published",
    category: parsed.meta.category ?? "",
    tags: parsed.meta.tags ?? [],
    series: parsed.meta.series ?? "",
    createdAt: now,
    updatedAt: now,
    publishedAt: parsed.meta.publishedAt ?? now.slice(0, 10),
  };
  const draft = { ...doc, status: "draft" };
  for (const [prefix, payload] of [
    [`drafts/${id}`, draft],
    [`published/${doc.slug}`, doc],
  ]) {
    const dir = path.join(outDir, prefix);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "document.json"), JSON.stringify(payload), "utf8");
    fs.writeFileSync(path.join(dir, "body.md"), parsed.body, "utf8");
  }
  count += 1;
  console.log(`imported ${doc.slug}`);
}
console.log(`imported ${count} published article(s)`);
