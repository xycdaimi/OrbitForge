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

仓储默认使用内存实现，便于本地单元测试；DynamoDB 实现后置。
