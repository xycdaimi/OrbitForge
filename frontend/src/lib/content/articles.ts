import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  articleFrontmatterSchema,
  type ArticleFrontmatter,
} from "./schema";
import { estimateReadingTime, type ReadingTime } from "./reading-time";

export type ArticleSource = {
  filepath: string;
  frontmatter: ArticleFrontmatter;
  body: string;
  readingTime: ReadingTime;
};

export type ParseArticleOptions = {
  filepath?: string;
  now?: Date;
};

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseArticleSource(
  raw: string,
  options: ParseArticleOptions = {},
): ArticleSource {
  const filepath = options.filepath ?? "<memory>";
  const { data, content } = matter(raw);
  const parsed = articleFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${filepath}: ${details}`);
  }

  return {
    filepath,
    frontmatter: parsed.data,
    body: content.trim(),
    readingTime: estimateReadingTime(content),
  };
}

export function assertUniqueSlugs(articles: ArticleSource[]): void {
  const seen = new Map<string, string>();

  for (const article of articles) {
    const slug = article.frontmatter.slug;
    const existing = seen.get(slug);
    if (existing) {
      throw new Error(
        `Duplicate article slug "${slug}" in ${article.filepath} and ${existing}`,
      );
    }
    seen.set(slug, article.filepath);
  }
}

export function isPublicArticle(
  article: ArticleSource,
  now: Date = new Date(),
): boolean {
  if (article.frontmatter.status !== "published") {
    return false;
  }

  return article.frontmatter.publishedAt <= toDateOnly(now);
}

export function getArticlesDirectory(): string {
  return path.join(process.cwd(), "content", "articles");
}

export function loadAllArticles(
  articlesDir: string = getArticlesDirectory(),
): ArticleSource[] {
  if (!fs.existsSync(articlesDir)) {
    return [];
  }

  const files = walkMdxFiles(articlesDir);
  const articles = files.map((filepath) => {
    const raw = fs.readFileSync(filepath, "utf8");
    return parseArticleSource(raw, { filepath });
  });

  assertUniqueSlugs(articles);
  return articles.sort((a, b) =>
    b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
  );
}

export function getPublishedArticles(
  articlesDir?: string,
  now: Date = new Date(),
): ArticleSource[] {
  return loadAllArticles(articlesDir).filter((article) =>
    isPublicArticle(article, now),
  );
}

export function getArticleBySlug(
  slug: string,
  articlesDir?: string,
  now: Date = new Date(),
): ArticleSource | undefined {
  return getPublishedArticles(articlesDir, now).find(
    (article) => article.frontmatter.slug === slug,
  );
}

function walkMdxFiles(dir: string): string[] {
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
