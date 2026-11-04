import fs from "node:fs";
import path from "node:path";
import {
  assertUniqueSlugAmongFiles,
  buildArticleScaffold,
  parseNewArticleArgs,
  resolveArticlePath,
  slugifyTitle,
} from "./new-article-lib";

function main(): void {
  const args = parseNewArticleArgs(process.argv.slice(2));
  const slug = args.slug ?? slugifyTitle(args.title);
  if (!slug) {
    throw new Error("无法从标题生成 slug，请使用 --slug 显式指定");
  }

  const articlesRoot = path.join(process.cwd(), "content", "articles");
  assertUniqueSlugAmongFiles(articlesRoot, slug);

  const filepath = resolveArticlePath(articlesRoot, args.category, slug);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const content = buildArticleScaffold({
    title: args.title,
    slug,
    category: args.category,
    publishedAt: today,
  });
  fs.writeFileSync(filepath, content, "utf8");

  const relative = path.relative(process.cwd(), filepath).replace(/\\/g, "/");
  console.log(`Created draft: ${relative}`);
  console.log(`Slug: ${slug}`);
  console.log('Set status to "published" when ready to ship.');
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
