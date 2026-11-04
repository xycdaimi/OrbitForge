import type { ApiErrorBody } from "./types";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = body.code;
    this.requestId = body.requestId;
  }
}

export function parseApiErrorBody(value: unknown): ApiErrorBody | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.code !== "string" ||
    typeof record.message !== "string" ||
    typeof record.requestId !== "string"
  ) {
    return null;
  }

  return {
    code: record.code,
    message: record.message,
    requestId: record.requestId,
  };
}
