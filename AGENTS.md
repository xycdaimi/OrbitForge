# OrbitForge — AGENTS.md

> 本文件是 OrbitForge（星轨实验室）的项目级 AI 开发规则，供 Cursor Agent 及其他支持 `AGENTS.md` 的编码助手使用。
> 放置位置：**Git 仓库根目录 `orbitforge/AGENTS.md`**。本文件规定「如何开发」，`README.md` 说明「项目是什么」，《个人博客编写方案.md》说明「目标方案与实施规划」。

## 0. Agent 工作契约（必须遵守）

1. **先理解再修改。** 开始任务前先阅读相关源码、`README.md`、实际存在的设计文档、`package.json` / `go.mod` / IaC 配置；不要假定规划中的目录和功能已实现。
2. **以用户当前任务为准，保持架构一致性。** 未经明确要求，不得擅自改变 Next.js 静态导出 + Go Lambda + AWS Serverless 的总体方案；如发现与现有代码冲突，说明取舍后做最小必要修改。
3. **增量开发，禁止无关重构。** 不为了实现一个页面重写整个项目、不批量修改无关格式、不无理由新增依赖或框架。
4. **真实可运行。** 不能把伪代码、假接口、占位数据当作已完成的功能；如果使用 mock，必须清楚标记并保证替换边界明确。
5. **默认使用中文交流。** 代码标识符、API 字段、提交信息可使用英文；技术说明、开发总结、必要注释优先中文，避免过度注释。
6. **不要编造结果。** 未实际执行的命令、未检查的页面、未部署的 AWS 资源、未测试的性能指标，一律不得声称已验证。
7. **保护项目与用户数据。** 不读取、输出或提交真实密钥；不擅自执行生产部署、资源删除、数据库清空、强制推送或其他不可逆操作。
8. **任务完成时必须汇报：** 改了什么、涉及哪些文件、执行了哪些测试及结果、仍有哪些风险或待办。未测试的地方明确说明。

## 1. 项目定位与边界

- **项目名：** OrbitForge（星轨实验室）
- **Slogan：** `Explore the Unknown. Engineer the Future.` / `探索未知，构建未来。`
- **定位：** 面向 AI 应用开发、模型训练、编程、分布式系统、系统架构、工具实践与创意设计的个人技术博客和工程实验室。
- **目标体验：** 未来科技实验室风格的个人主页 + 专业、易读的深度技术文章 + 可逐步扩展的实验与项目展示。
- **状态认知：** 当前仓库可能处于初始化或逐步实施阶段。功能以源码和实际运行结果为准，路线图不代表已经上线。

### 研发优先级

`内容正确与可读性 > 静态部署兼容 > 无障碍与性能 > 视觉动效 > 装饰性功能`

**第一阶段（MVP）：** 首页、文章列表/详情、分类/标签/搜索、Projects、About、SEO/RSS/站点地图、移动端适配与静态部署。

**后续阶段：** 科技视觉增强 → Go Lambda 动态 API → AI Lab、交互式架构图和实验可视化。

**非首期目标：** 独立 CMS、用户账号系统、复杂权限、自建 OAuth、多租户、实时大模型聊天服务、持续运行的 Node.js 后端。

## 2. 技术栈与硬性架构约束

| 层次 | 规定 / 首选方案 |
| --- | --- |
| Web | Next.js App Router、React、TypeScript（严格模式） |
| UI | Tailwind CSS、shadcn/ui / Radix UI、lucide-react |
| 动效 | Motion；Three.js / React Three Fiber 仅按需使用 |
| 内容 | Git + MDX + Frontmatter；构建时生成静态文章 |
| 内容增强 | Shiki（或现有高亮方案）、Mermaid、KaTeX |
| 搜索 | 构建时生成索引，前端 MiniSearch/Fuse.js 等轻量方案 |
| API | API Gateway HTTP API → AWS Lambda（Go） |
| Go 运行时 | `provided.al2023`，优先评估 `arm64`，AWS SDK for Go v2 |
| 数据 | 按需使用 DynamoDB；静态文章不进入数据库 |
| 基础设施 | AWS CDK（TypeScript）优先，与当前项目实际 IaC 保持一致 |
| CDN / 存储 | 私有 S3 + CloudFront（OAC），必要时 CloudFront Functions |
| CI/CD | GitHub Actions + AWS OIDC（不使用长期 Access Key） |

### 2.1 前端必须满足静态导出

- 目标是执行 `next build` 生成可部署到 S3 的静态产物（通常为 `frontend/out/`）。
- `next.config` 应与以下原则一致：`output: 'export'`、统一 `trailingSlash: true`；无独立图片服务时使用 `images: { unoptimized: true }` 或兼容静态导出的自定义 loader。
- 所有文章详情、标签等构建时可枚举的动态路由必须提供 `generateStaticParams()`；草稿和不存在的 slug 不得意外生成公开页面。
- 禁止为了普通功能引入依赖请求时服务器运行的 SSR、Server Actions、ISR、动态 `cookies()` / `headers()`、运行时重定向或代理、服务端动态鉴权与默认 Next.js 图片优化服务。
- **可以**使用构建时运行的 Server Components、静态生成的 GET Route Handlers；**不能**使用依赖访问者请求信息的动态 Route Handler 作为线上 API。
- 浏览器端交互通过 Client Components 与 `/api/v1/*` 调用 Go Lambda；不要把整个根布局无必要地标记为 `"use client"`。
- 浏览器对象 `window`、`document`、`localStorage`、WebGL API 只能在客户端安全使用，避免 SSR/SSG 水合错误。
- 每次更改路由、MDX 流程、Next.js 配置或插件后，必须优先验证**生产静态构建**，不能只验证 `npm run dev`。

### 2.2 前后端职责清楚分离

- **前端 / 构建期：** 公共页面、MDX 内容、分类、元数据、RSS、sitemap、搜索索引、静态图片。
- **Go API：** 联系表单、反馈、文章反应/点赞、将来可能出现的动态实验数据。
- 不要让公开文章渲染依赖在线 Go API、DynamoDB、AWS 凭证或网络请求。
- API 客户端集中在 `frontend/src/lib/api/`（或仓库现有等价目录），统一类型、错误处理、超时和环境配置。
- 新增需要运行时服务端逻辑的需求，先判断能否在 Go Lambda 实现；确实不适用时先说明架构影响。

## 3. 仓库结构约定

> 以下是**目标结构**。若现有仓库采用其他已运行结构，优先沿用，不得机械迁移；新建项目时以此作为默认布局。

```text
orbitforge/
├── AGENTS.md
├── README.md
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router 路由
│   │   ├── components/
│   │   │   ├── ui/               # 基础 UI
│   │   │   ├── layout/           # 导航、页脚、布局
│   │   │   ├── blog/             # 文章、目录、代码块
│   │   │   ├── cards/            # 文章/项目/实验卡片
│   │   │   ├── effects/          # 首页局部视觉特效
│   │   │   └── lab/              # AI Lab 组件
│   │   ├── lib/
│   │   │   ├── content/          # MDX 读取、校验、索引
│   │   │   ├── seo/              # metadata、RSS、sitemap
│   │   │   ├── search/           # 搜索索引
│   │   │   └── api/              # Go API 客户端
│   │   ├── styles/
│   │   └── types/
│   ├── content/
│   │   ├── articles/
│   │   ├── experiments/
│   │   └── projects/
│   ├── public/
│   ├── scripts/
│   └── next.config.ts
├── backend/
│   ├── cmd/api/
│   ├── internal/{handler,service,repository,model,middleware}/
│   └── go.mod
├── infrastructure/
│   └── cdk/
├── docs/
│   ├── ADR/
│   ├── API.md
│   ├── CONTENT_GUIDE.md
│   ├── DEPLOY.md
│   └── OPEN_SOURCE_ATTRIBUTIONS.md
└── .github/workflows/
```

### 路由约定

- `/`：Home / 个人实验室首页。
- `/articles/`：文章列表、分类/标签/搜索入口。
- `/articles/[slug]/`：静态文章详情。
- `/tags/[tag]/`：标签聚合（如实现）。
- `/lab/`：AI Lab / 模型与算法实验。
- `/architecture/`：架构设计内容。
- `/projects/`：开源项目。
- `/about/`：个人介绍。
- `/search/`：可选的搜索独立页。

统一处理尾部斜杠、内部链接和 canonical URL，不出现同一文章的多个可索引 URL。

## 4. UI / UX：未来科技实验室设计规范

### 4.1 设计原则

- 关键词：**Deep Space、Digital Research Lab、Cyber Cyan、Violet、Precision、Subtle Motion**。
- 首页要有个人技术品牌辨识度，但不能牺牲载入速度或信息可读性。
- 文章详情页以阅读为主：禁止全屏持续粒子、滚动干扰、强制 Glitch、复杂光污染和自定义鼠标等影响阅读的装饰。
- 优先使用设计 Token 和可复用组件；不要在各页面散落相互矛盾的硬编码颜色与阴影。
- UI 文案可以中英混排，但不能为了酷炫牺牲中文读者的理解。

### 4.2 基础颜色 Token

| Token | 值 | 用途 |
| --- | --- | --- |
| `bg.primary` | `#070D19` | 深空黑页面背景 |
| `bg.surface` | `#101E32` | 卡片 / 面板 |
| `bg.elevated` | `#14283F` | 高层级控件 |
| `accent.cyan` | `#38D9F5` | 主交互和科技视觉 |
| `accent.violet` | `#906BFA` | 次强调 / 实验标签 |
| `state.success` | `#70E2AF` | 有明确含义的成功状态 |
| `text.primary` | `#F3F8FF` | 标题 / 正文 |
| `text.secondary` | `#9BB3CB` | 次级文本 |
| `border.default` | `#22364C` | 边界与分割线 |

CSS 变量、Tailwind 语义 Token 与组件主题要保持一致。青色、紫色只作强调，不铺满所有卡片；对比度与语义优先。

### 4.3 字体、布局与响应式

- 中文系统无衬线优先；界面英文可用 Inter；代码可用 JetBrains Mono 或兼容字体。
- 技术文章正文建议最大宽度约 `720–800px`，长段落行高适中，保证中文、英文与代码混排可读。
- 桌面端文章可采用「文章信息 / 正文 / 目录」布局；移动端单列，目录收纳为可访问的抽屉。
- 最低适配桌面、平板、手机；不允许页面整体横向溢出。代码块单独横向滚动，复杂图表支持缩放与备用文字描述。
- 支持键盘操作、可见焦点、语义化 HTML、图片替代文本、表单标签与错误提示。

### 4.4 动效与性能

- L0：正文、表单等核心场景默认不使用装饰动画。
- L1：卡片悬停和切换使用短暂、低干扰微动效。
- L2：Bento 区块可渐入/轻微位移。
- L3：首页指定 Hero 区域可使用星空/轨道/3D，**仅客户端按需加载**。
- 遵守 `prefers-reduced-motion`，实现静态降级；低性能设备、移动端和不支持 WebGL 的浏览器优先简化效果。
- 避免不必要的全站水合、重复动画库、巨大纹理和阻塞首屏的脚本；优先静态背景，再渐进增强。

## 5. React / TypeScript 编码规范

1. TypeScript 开启 `strict`；禁止以 `any`、`@ts-ignore` 和非空断言掩盖设计问题。特殊情况说明原因、缩小作用范围。
2. React 使用函数组件与 Hooks；除交互需要外优先使用 Server Components（静态构建期执行）。
3. 组件保持单一职责；页面组装与数据转换/内容解析分离；复用组件优先于大文件复制。
4. 组件 Props、业务实体、API 请求/响应显式定义类型；对外部输入使用运行时校验（如 Zod 或已有方案）。
5. 不在渲染过程中执行有副作用的操作；Effect 仅处理真实客户端副作用，清理监听器、定时器、Canvas/WebGL 资源。
6. 数据获取与错误处理遵循统一模块；提供 loading、empty、error 与必要的 retry 状态。
7. 样式以 Tailwind + 设计 Token 为主，必要时引入 CSS Modules / 全局变量；避免庞大内联样式和到处复制颜色值。
8. UI 优先复用 shadcn/ui / Radix，不重复造已有的复杂无障碍组件。
9. 避免没有收益的全局状态管理；局部状态用 Hooks，跨页面状态选用现有项目方案。
10. 使用已有包管理器与锁文件；新增包前先检查现有依赖，说明用途与客户端体积影响，不随意升级主版本。
11. 文件、目录、变量名使用语义清晰的英文；组件 `PascalCase`、函数变量 `camelCase`、常量按现有风格；保持导入路径与格式一致。
12. 不制造虚假的项目统计、模型准确率、实验曲线、已上线链接；占位内容必须标注为示例。

## 6. MDX 内容与技术文章规则

### 6.1 内容来源

- 第一阶段 **Git 仓库中的 MDX 是文章唯一可信来源**，以构建时生成静态页面的方式发布。
- 文章按分类或系列放在 `frontend/content/articles/`，不要在 UI 中手写文章数组与正文内容。
- 构建时生成文章目录、标签、系列、RSS、sitemap 和搜索索引；禁止把整个 MDX 源文打包给所有访客。
- 原文只展示已发布状态；草稿和归档内容的公开策略由内容模块统一控制，禁止单页自行放行。

### 6.2 Frontmatter 基础约定

```yaml
---
title: "分布式任务执行系统的设计与权衡"
slug: "distributed-task-execution"
description: "异步任务、资源隔离、可靠性与可观测性的设计实践。"
publishedAt: "2026-11-04"
updatedAt: "2026-11-04"
status: "draft" # draft | published | archived
category: "Architecture"
tags: ["Go", "Distributed Systems", "Queue"]
series: "Engineering Architecture"
featured: false
cover: "/images/articles/distributed-task-execution/cover.webp"
author: "site-owner"
---
```

- 读取时验证必填字段、日期格式、slug 唯一性、标签类型和封面路径；不合规则给出清楚的构建错误。
- `slug` 一旦公开应尽量稳定；改名必须考虑旧 URL 跳转、canonical 或迁移策略。
- `readingTime` 由构建时计算，不要求作者手动维护。
- 代码必须标注语言，避免展示私钥、Token、内部 IP、真实用户数据或未经清理的工作日志。
- Mermaid、KaTeX、代码高亮应提供可读退化行为；对不可信内容不得直接执行任意 MDX/JSX 或未经清理的 HTML。
- 文章元数据应生成符合搜索引擎规范的 `title`、`description`、canonical、Open Graph / Twitter Card，以及适当的结构化数据。

## 7. Go Lambda 后端规范

### 7.1 服务边界

- Go Lambda 仅承担确有必要的动态功能；文章详情不应请求 Lambda 来获得正文。
- 推荐采用 `cmd/` 入口、`internal/handler` HTTP 适配、`service` 业务逻辑、`repository` 数据访问、`model` 请求/响应类型。
- Handler 不直接堆叠 DynamoDB 业务查询；业务逻辑应尽量可单元测试，不依赖真实 AWS 服务。
- 使用 `context.Context`、明确超时、结构化日志和 AWS SDK for Go v2。
- 使用 `provided.al2023`，编译目标与部署架构一致；建议 `GOOS=linux GOARCH=arm64 CGO_ENABLED=0`，在实际 CI 中验证 `bootstrap` 包装和运行时配置。

### 7.2 API（按优先级逐步实现）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/v1/health` | 健康状态，仅返回安全字段 |
| `POST` | `/api/v1/feedback` | 访客反馈 |
| `GET` | `/api/v1/articles/{slug}/reactions` | 文章反应汇总 |
| `POST` | `/api/v1/articles/{slug}/reactions` | 提交文章反应 |
| `POST` | `/api/v1/contact` | 联系表单；有真实需求时实现 |
| `GET` | `/api/v1/experiments/{slug}/summary` | 动态实验摘要；后续可选 |

- API 不因存在于表格中就视为已实现；只编写当前任务需要的接口。
- 路由参数、请求体和外部输入必须验证格式、长度、枚举、请求体大小；合理返回 400/404/409/429/500 等状态。
- 错误结构采用稳定的 JSON 格式，例如 `{"code":"INVALID_ARGUMENT","message":"...","requestId":"..."}`；不要向客户端返回堆栈和内部系统细节。
- 写接口设计基本防滥用能力（速率限制、反机器人、必要时幂等）；`localStorage` 不能代替服务端反刷。
- 日志使用结构化字段，如 `request_id`、`route`、`status`、`latency_ms`；不记录完整邮箱、消息正文、令牌或其他敏感数据。
- API 契约更新后同步更新 `docs/API.md` 或仓库现有 API 文档。

## 8. AWS Serverless / IaC / 部署规范

- 静态站点：**私有 S3（Block Public Access）+ CloudFront Origin Access Control（OAC）**，不要把桶设为公开网站托管。
- `CloudFront` 默认缓存行为指向 S3；优先匹配 `/api/*` 行为并转发到 API Gateway HTTP API，动态写请求默认禁止缓存。
- 配合 `trailingSlash: true`，私有 S3 Origin 必须处理 `/articles/slug/ → /articles/slug/index.html` 等深层路径，优先使用只作用于静态行为的 CloudFront Function；不要将 `/api/*` 重写成 HTML。
- 不存在的页面应尽量保持正确 404 状态，不能用 SPA 首页回退掩盖错误；特别验证私有 S3 可能出现的 403/404 差异及 API 错误不被覆盖。
- CloudFront 自定义域名的 ACM 证书应位于 `us-east-1`；AWS Region、域名、账户号、资源名等必须从配置获取，不得在示例中硬编码真实账户数据。
- IAM 最小权限；GitHub Actions → AWS 使用 OIDC 并限定仓库与分支，不使用长期 AK/SK；Secrets Manager/SSM 负责敏感配置（按需）。
- DynamoDB 按需计费优先；不为个人博客引入常驻数据库或长期运行服务器；CloudWatch 设置合理日志保留期，增加预算告警。
- CSS/JS 等带 hash 的静态资源可长缓存；HTML/RSS/站点地图使用合理的更新策略；发布时按需失效或采用版本化资源。
- 不自动部署生产环境或删除云资源。任何 `cdk deploy`、`cdk destroy`、`aws s3 sync --delete`、CloudFront 失效或线上数据写入，都应在用户明确授权后执行，并先说明影响。
- IaC 变更先做 `cdk synth` / diff（如果脚本可用），并审查资源替换、公开访问、IAM 权限与可能产生的费用。

## 9. 安全、许可与性能底线

### 安全

- `.env*` 中的真实凭证、私钥、Token、邮件服务密钥不可提交。`NEXT_PUBLIC_*` 会暴露在客户端产物，绝对不能承载密钥。
- 公共表单防注入、防脚本执行、防垃圾提交；链接与外部资源校验目标，必要时设置 CSP、Referrer-Policy 等安全响应头。
- 客户端无法直接访问 DynamoDB 或持有 AWS 凭证；所有有权限的数据操作走受控 Go API。
- 不渲染不受信任的未净化 HTML；对外链使用合理的安全属性。

### 开源与版权

- OrbitForge 仓库目前 **License 待确定**；不要未经许可把仓库标记成 MIT / Apache-2.0。
- Ahnafnafee.dev 用作内容与工程设计参考，Anvians Portfolio 用作未来科技视觉参考；复制代码或素材前核对对应版本许可证，并在需要时保留原作者声明。
- 不默认使用原项目的人物照片、Logo、文章、社交链接、品牌身份或未经授权的付费资产。

### 可访问性与性能

- 尊重 `prefers-reduced-motion`；交互控件需有键盘焦点、名称和可访问状态。
- 首页可以有 3D，但不能导致文章阅读明显卡顿；移动端优先降低特效、按需加载。尽量控制 LCP、CLS、INP，但不得伪造 Lighthouse 分数。
- 图片压缩并提供正确尺寸、`alt` 和懒加载；文章首屏的关键视觉优先加载，非关键内容延后。

## 10. 测试与完成标准（Definition of Done）

### 每次代码修改最低要求

1. 确认新增/修改功能在仓库现有目录和路由下真实存在。
2. 运行相关的 lint / TypeScript 检查 / 单元测试（如果对应脚本已配置）。
3. 修改文章、路由、配置或构建流程时，执行前端**生产构建**并检查生成的静态文件。
4. 修改 Go 时执行 `go test ./...`，必要时运行 `go vet ./...`；涉及 Lambda 构建时验证 Linux 目标二进制打包。
5. 修改公开交互界面时覆盖移动端、键盘、空状态、错误状态、降低动效偏好。
6. 修改 API、架构或部署流程时同步更新相关文档/示例环境变量。
7. 不能运行的检查必须说明原因，不允许写「测试通过」。

### 推荐命令（以仓库实际 scripts、锁文件和工具链为准）

```bash
# 前端：确认存在对应 package.json scripts 后执行
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build

# Go：在 backend/ 已建立 go.mod 后执行
cd backend
go test ./...
go vet ./...

# IaC：仅在 infrastructure/cdk/ 已初始化且 scripts 存在时执行
cd infrastructure/cdk
npm run synth
```

> 如果项目使用 pnpm/yarn/bun，遵从已提交的锁文件，不要机械执行 npm 命令。若某个脚本不存在，应建立合理脚本或说明跳过，而不是伪报成功。

### 静态站点重点验收

- 新发布文章被生成，草稿不公开；目录、标签和搜索索引一致。
- `/articles/slug/` 刷新和直接打开均正常；不存在的 slug 为真正的未找到页面。
- 文章中的代码、图片、Mermaid、公式正常显示，移动端不整体横向滚动。
- `sitemap.xml`、`robots.txt`、RSS、canonical、Open Graph 信息可访问并正确指向正式域名（域名未定时不可写死假地址）。
- API `/api/*` 不被静态缓存或 URL 重写误处理；错误响应与 CORS/同域策略符合预期。

## 11. Cursor Agent 执行流程

对于每个开发请求，遵循以下步骤：

1. **Inspect**：定位相关文件、阅读现有实现及项目文档，确认当前实现阶段。
2. **Plan**：如涉及多文件、接口、架构或较大功能，先简要列出实施步骤与可能影响；简单修改无需冗长计划。
3. **Implement**：按最小可交付改动实现完整的垂直切片；优先复用现有工具、组件与约定。
4. **Validate**：执行实际可用的构建、测试、静态导出、类型检查和必要的手工验证。
5. **Document**：架构/API/内容模型变化时更新文档；示例配置与真实文件保持同步。
6. **Report**：用中文给出简短摘要，包括修改文件、验证结果、已知限制和下一步可选事项。

### 拒绝以下开发坏习惯

- 为了页面视觉效果牺牲文章可读性、可访问性或静态导出能力。
- 为了让构建通过而删除必要验证、吞掉错误、使用大面积 `any` 或伪造数据。
- 只写静态 UI 却宣称已实现后端功能；只运行开发服务器却宣称已验证 S3 / CloudFront 部署。
- 未调查现有工具链就切换包管理器、升级框架、添加大量依赖。
- 没有用户授权就执行云端生产操作或破坏性 Git 操作。

## 12. 项目资料与权威参考

开发前优先检查仓库中实际存在的以下文件（不存在时不要假设已创建）：

- `README.md`：品牌、项目现状、功能路线图。
- `docs/` 下的 PRD、系统架构、API、内容规范与 ADR。
- 《个人博客编写方案.md》：原始完整建设方案；若已迁入 `docs/`，以仓库现有路径为准。
- `frontend/package.json`、`frontend/next.config.ts`、`backend/go.mod`、`infrastructure/cdk/`：真实技术约束与可执行入口。

参考官方文档（遇到版本兼容问题时核对当前版本）：

- Cursor Rules / AGENTS.md：https://cursor.com/docs/rules
- Next.js Static Export：https://nextjs.org/docs/app/guides/static-exports
- AWS Lambda for Go：https://docs.aws.amazon.com/lambda/latest/dg/lambda-golang.html
- CloudFront OAC：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- AWS CDK：https://docs.aws.amazon.com/cdk/

---

**核心开发准则：**

> **先交付一个稳定、好读、可静态部署的技术博客，再逐步把 OrbitForge 打磨成有辨识度的 AI Engineering Lab。**
>
> **Make the homepage expressive. Keep the reading experience focused.**
