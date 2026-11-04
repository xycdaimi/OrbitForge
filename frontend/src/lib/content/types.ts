import type { ArticleFrontmatter } from "./schema";
import type { ReadingTime } from "./reading-time";
import type { TocItem } from "./toc";

export type { TocItem };

export type ArticleSource = {
  filepath: string;
  frontmatter: ArticleFrontmatter & {
    cover?: string;
    series?: string;
  };
  body: string;
  readingTime: ReadingTime;
};

export type ProjectSource = {
  filepath: string;
  frontmatter: {
    slug: string;
    title: string;
    description: string;
    stack: string[];
    repoUrl?: string;
    demoUrl?: string;
    status: "active" | "archived" | "experimental";
    cover?: string;
    featured: boolean;
    publishedAt: string;
    example: boolean;
  };
  body: string;
};

export type ExperimentSource = {
  filepath: string;
  frontmatter: {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    status: "draft" | "published" | "archived";
    example: boolean;
    model?: string;
    framework?: string;
    dataset?: string;
    hardware?: string;
    metricsPath?: string;
  };
  body: string;
};

export type ArchitectureSource = {
  filepath: string;
  frontmatter: {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    status: "draft" | "published" | "archived";
    tags: string[];
  };
  body: string;
};
