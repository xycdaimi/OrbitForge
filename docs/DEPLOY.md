# OrbitForge 部署说明（AWS CLI）

本阶段使用 `infrastructure/cli/` 下的 PowerShell 脚本部署，**不使用 CDK**，也不包含 GitHub Actions。

## 前置条件

- AWS CLI v2，profile 默认为 `xyc`
- 区域默认为 `us-west-2`
- 本机已安装 Go（用于交叉编译 `linux/arm64` Lambda）
- 本机已安装 Node.js / npm（用于 `frontend` 静态导出）

保留账户中已有的 `CDKToolkit` 与 `code-xyc-*` 桶；本脚本只管理 `orbitforge-*` 前缀资源。

## 一键部署

在仓库根目录执行：

```powershell
pwsh -File infrastructure/cli/deploy.ps1
```

可选参数：

- `-SkipFrontendBuild`：只同步已有 `frontend/out/`
- `-SkipSmoke`：跳过部署后的 HTTP 检查

脚本会幂等创建或更新：

1. DynamoDB：`OrbitForgeFeedback`、`OrbitForgeReactions`（按需计费）
2. IAM 角色 `orbitforge-api-role`（CloudWatch Logs + 上述两表）
3. Lambda `orbitforge-api`（`provided.al2023` / `arm64`，`REPOSITORY=dynamodb`）
4. API Gateway HTTP API `orbitforge-http-api`
5. 私有 S3 桶 `orbitforge-site-<account>-us-west-2`
6. CloudFront OAC、索引重写 Function（仅静态行为）、分发（默认回源 S3，`/api/*` 回源 API 且禁用缓存）
7. 用 CloudFront 域名重建并同步前端静态产物

部署结果写入本地 `infrastructure/cli/state.json`（已 gitignore），终端会打印站点 URL。

## 只发布文章 / 静态页

改 MDX、样式或前端页面时，**不要**再跑完整 `deploy.ps1`。在至少成功执行过一次全量部署后：

```powershell
powershell -File infrastructure/cli/publish-content.ps1
```

该脚本会：

1. 读取 `state.json` 中的桶、CloudFront 分发与站点 URL
2. 构建 `frontend` 并 `s3 sync` 到站点桶
3. 创建 CloudFront `/*` 失效
4. 对首页、一篇文章、`/rss.xml` 做烟雾检查

不创建或更新 Lambda、DynamoDB、API Gateway、CloudFront 配置。可选参数：`-SkipBuild`、`-SkipSmoke`、`-SmokeArticleSlug <slug>`。

写作流程详见 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)。

## 环境变量（前端）

部署脚本构建前端时临时设置：

- `NEXT_PUBLIC_SITE_URL=https://<cloudfront-domain>`
- `NEXT_PUBLIC_API_BASE_URL=/api/v1`

本地开发继续参考 `frontend/.env.example`。作者账号写在 `infrastructure/cli/.env`（示例见同目录 `.env.example`）。密码至少 8 位，且同时包含大写字母、小写字母、数字和符号。不要把含真实邮箱或密码的 `.env` 提交入库。

## 烟雾检查

脚本默认请求：

- `/`
- `/articles/go-lambda-api-boundary/`
- `/api/v1/health`

CloudFront 初次创建需要数分钟传播；若深链暂时 403/404，等待后再测。脚本**不会**把 API 错误改写成 200。

## 手动验证示例

```powershell
$site = (Get-Content infrastructure/cli/state.json | ConvertFrom-Json).SiteUrl
curl.exe -sI "$site/"
curl.exe -sI "$site/articles/go-lambda-api-boundary/"
curl.exe -s "$site/api/v1/health"
```

## 本阶段不做

自定义域名 / ACM、SES 联系表单、WAF、预算告警、GitHub Actions OIDC。
