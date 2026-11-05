# OrbitForge API

本地可单测的 Go Lambda HTTP API 约定。当前不要求已部署到 AWS。

## 通用

- 前缀：`/api/v1`
- 成功响应：业务 JSON
- 错误响应：

```json
{
  "code": "INVALID_ARGUMENT",
  "message": "…",
  "requestId": "…"
}
```

## 端点

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/v1/health` | 健康检查，返回 `{ "status": "ok" }` |
| `POST` | `/api/v1/feedback` | 提交文章反馈 |
| `GET` | `/api/v1/articles/{slug}/reactions` | 反应汇总 |
| `POST` | `/api/v1/articles/{slug}/reactions` | 提交反应（`useful` / `insightful`） |
| `GET` | `/api/v1/studio/documents` | 作者草稿列表。需要 `Authorization: Bearer` |
| `POST` | `/api/v1/studio/documents` | 新建草稿 |
| `GET` | `/api/v1/studio/documents/{id}` | 读取草稿与正文 |
| `PUT` | `/api/v1/studio/documents/{id}` | 保存草稿 |
| `POST` | `/api/v1/studio/documents/{id}/publish` | 写入已发布副本并启动构建，返回 `{ jobId, status, slug }`，HTTP 202 |
| `POST` | `/api/v1/studio/documents/{id}/unpublish` | 删除已发布副本并启动构建 |
| `GET` | `/api/v1/studio/publish-jobs/{id}?documentId=` | 查询构建。`SUCCEEDED` 后草稿才标为 published |
| `POST` | `/api/v1/studio/media` | 上传图片到内容桶 `media/`，JSON：`filename`、`contentType`、`dataBase64` |

未登录访问 `/api/v1/studio/*` 返回 `401` / `UNAUTHENTICATED`。内容仓储未配置返回 `503` / `UNAVAILABLE`。发布器未配置同样返回 `503`。构建失败时稿件保持 `draft`。

作者后台环境变量（不写入 Git）：

```text
CONTENT_BUCKET
CODEBUILD_PROJECT
COGNITO_USER_POOL_ID
COGNITO_CLIENT_ID
```

一次性导入已发布 MDX（不触发公开站点重建）：

```text
powershell -File infrastructure/cli/import-content.ps1
```

`deploy.ps1` 会创建内容桶、仅允许管理员创建用户的 Cognito、CodeBuild 项目，并把上述变量写入 Lambda。作者邮箱与密码从本机 `ORBITFORGE_AUTHOR_EMAIL`、`ORBITFORGE_AUTHOR_PASSWORD` 读取。部署需人工确认后再执行。

仓储默认使用内存实现（`REPOSITORY` 未设置或非 `dynamodb`）。生产可设置：

```text
REPOSITORY=dynamodb
FEEDBACK_TABLE=OrbitForgeFeedback
REACTIONS_TABLE=OrbitForgeReactions
```

DynamoDB 实现通过可注入的 client 接口编写，单元测试不访问真实 AWS。
