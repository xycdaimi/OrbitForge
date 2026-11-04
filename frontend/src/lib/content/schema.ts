import { z } from "zod";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD 格式");

export const articleStatusSchema = z.enum(["draft", "published", "archived"]);

export const articleFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能包含小写字母、数字和连字符"),
  description: z.string().min(1),
  publishedAt: isoDateString,
  updatedAt: isoDateString.optional(),
  status: articleStatusSchema,
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  series: z.string().min(1).optional(),
  featured: z.boolean().default(false),
  cover: z.string().min(1).optional(),
  author: z.string().min(1),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type ArticleStatus = z.infer<typeof articleStatusSchema>;
