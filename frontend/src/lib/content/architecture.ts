import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD 格式");

export const architectureFrontmatterSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: isoDateString,
  tags: z.array(z.string().min(1)).default([]),
});

export type ArchitectureFrontmatter = z.infer<
  typeof architectureFrontmatterSchema
>;

export type ArchitectureSource = {
  filepath: string;
  frontmatter: ArchitectureFrontmatter;
  body: string;
};

export function parseArchitectureSource(
  raw: string,
  filepath = "<memory>",
): ArchitectureSource {
  const { data, content } = matter(raw);
  const parsed = architectureFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(
      `Invalid architecture frontmatter in ${filepath}: ${details}`,
    );
  }
  return {
    filepath,
    frontmatter: parsed.data,
    body: content.trim(),
  };
}

export function getArchitectureDirectory(): string {
  return path.join(process.cwd(), "content", "architecture");
}

export function getPublishedArchitecture(
  dir: string = getArchitectureDirectory(),
): ArchitectureSource[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(dir, name));
  return files
    .map((filepath) =>
      parseArchitectureSource(fs.readFileSync(filepath, "utf8"), filepath),
    )
    .filter((item) => item.frontmatter.status === "published")
    .sort((a, b) =>
      b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
    );
}

export function getArchitectureBySlug(
  slug: string,
): ArchitectureSource | undefined {
  return getPublishedArchitecture().find(
    (item) => item.frontmatter.slug === slug,
  );
}
