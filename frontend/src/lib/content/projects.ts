import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD 格式");

export const projectStatusSchema = z.enum([
  "active",
  "archived",
  "experimental",
]);

export const projectFrontmatterSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能包含小写字母、数字和连字符"),
  title: z.string().min(1),
  description: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  status: projectStatusSchema,
  cover: z.string().min(1).optional(),
  featured: z.boolean().default(false),
  publishedAt: isoDateString,
  example: z.boolean().default(false),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export type ProjectSource = {
  filepath: string;
  frontmatter: ProjectFrontmatter;
  body: string;
};

export function parseProjectSource(
  raw: string,
  filepath = "<memory>",
): ProjectSource {
  const { data, content } = matter(raw);
  const parsed = projectFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid project frontmatter in ${filepath}: ${details}`);
  }

  return {
    filepath,
    frontmatter: parsed.data,
    body: content.trim(),
  };
}

export function getProjectsDirectory(): string {
  return path.join(process.cwd(), "content", "projects");
}

export function getPublishedProjects(
  projectsDir: string = getProjectsDirectory(),
): ProjectSource[] {
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(projectsDir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(projectsDir, name));

  const projects = files.map((filepath) =>
    parseProjectSource(fs.readFileSync(filepath, "utf8"), filepath),
  );

  const slugs = new Set<string>();
  for (const project of projects) {
    if (slugs.has(project.frontmatter.slug)) {
      throw new Error(`Duplicate project slug "${project.frontmatter.slug}"`);
    }
    slugs.add(project.frontmatter.slug);
  }

  return projects.sort((a, b) =>
    b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
  );
}
