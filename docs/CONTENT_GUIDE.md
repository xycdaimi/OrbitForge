# OrbitForge 内容编写指南

本文说明如何用 **Git + MDX** 写稿、本地预览并发布到线上。站点不做独立 CMS：改文件、构建、同步静态产物即发布。

## 目录约定

| 类型 | 路径 |
| --- | --- |
| 文章 | `frontend/content/articles/<category>/` |
| 项目 | `frontend/content/projects/` |
| 实验 | `frontend/content/experiments/` |
| 架构 | `frontend/content/architecture/` |
| 静态图 | `frontend/public/images/` |

文章建议按分类分子目录，例如 `articles/architecture/`、`articles/programming/`。公开 URL 只使用 frontmatter 里的 `slug`，与文件名目录无关。

## 新建文章

在 `frontend/` 下执行：

```bash
npm run new:article -- --title "文章标题" --category Programming
```

可选参数：

- `--slug my-custom-slug`：不传则由标题生成 kebab-case
- `--category`：默认 `Programming`，目录名会转成小写连字符

生成文件默认为 `status: draft`，不会出现在公开列表、搜索、sitemap、RSS。

## Frontmatter（文章）

```yaml
---
title: "文章标题"
slug: "article-slug"
description: "一句话摘要，用于列表与 SEO。"
publishedAt: "2026-11-04"
updatedAt: "2026-11-04"   # 可选
status: "draft"            # draft | published | archived
category: "Programming"
tags: ["TypeScript", "Next.js"]
series: "Engineering Architecture"  # 可选
featured: false
cover: "/images/articles/article-slug/cover.webp"  # 可选，相对 public/
author: "site-owner"
---
```

规则：

- `slug` 仅小写字母、数字与连字符，全站唯一
- 只有 `status: published` 且 `publishedAt` 不晚于构建日的文章会公开
- `archived` 与 `draft` 一样不公开
- 不要在正文或 frontmatter 里写真实密钥、Token、内网地址

## 正文能力

- Markdown / GFM
- 代码块请标注语言（如 ` ```ts `）
- Mermaid：\`\`\`mermaid 代码块
- 公式：KaTeX（`$...$` / `$$...$$`）
- 图片放在 `frontend/public/`，正文用绝对路径如 `/images/...`

## 本地预览

```bash
cd frontend
npm run dev
```

草稿不会出现在 `/articles/`。若要预览即将发布的内容，可临时改为 `published`，确认后再提交；或先构建查看 `out/`。

校验：

```bash
npm run typecheck
npm run test
npm run build
```

Frontmatter 不合规时构建会失败并指出文件路径。

## 发布上线

1. 将 `status` 改为 `published`，核对摘要、标签、封面路径。
2. 本地 `npm run build` 确认通过。
3. **只改文章/静态页**时，在仓库根目录执行：

```powershell
powershell -File infrastructure/cli/publish-content.ps1
```

该脚本只构建前端并同步 S3 + CloudFront 失效，不部署 Lambda。

4. **首次建站或改 API / 基础设施**时，才使用：

```powershell
powershell -File infrastructure/cli/deploy.ps1
```

5. 用 CloudFront 域名检查：首页、文章深链、`/rss.xml`、相关标签页。

没有自定义域名时，站点 URL 以 `infrastructure/cli/state.json` 中的 `SiteUrl` 为准（本地文件，不提交）。
