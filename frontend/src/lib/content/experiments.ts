import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD 格式");

export const experimentFrontmatterSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  model: z.string().min(1).optional(),
  framework: z.string().min(1).optional(),
  dataset: z.string().min(1).optional(),
  hardware: z.string().min(1).optional(),
  metricsPath: z.string().min(1).optional(),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: isoDateString,
  example: z.boolean().default(true),
});

export type ExperimentFrontmatter = z.infer<typeof experimentFrontmatterSchema>;

export type ExperimentSource = {
  filepath: string;
  frontmatter: ExperimentFrontmatter;
  body: string;
};

export function parseExperimentSource(
  raw: string,
  filepath = "<memory>",
): ExperimentSource {
  const { data, content } = matter(raw);
  const parsed = experimentFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid experiment frontmatter in ${filepath}: ${details}`);
  }
  return {
    filepath,
    frontmatter: parsed.data,
    body: content.trim(),
  };
}

export function getExperimentsDirectory(): string {
  return path.join(process.cwd(), "content", "experiments");
}

export function getPublishedExperiments(
  dir: string = getExperimentsDirectory(),
): ExperimentSource[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(dir, name));
  const items = files
    .map((filepath) =>
      parseExperimentSource(fs.readFileSync(filepath, "utf8"), filepath),
    )
    .filter((item) => item.frontmatter.status === "published")
    .sort((a, b) =>
      b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
    );
  return items;
}

export function getExperimentBySlug(slug: string): ExperimentSource | undefined {
  return getPublishedExperiments().find(
    (item) => item.frontmatter.slug === slug,
  );
}
