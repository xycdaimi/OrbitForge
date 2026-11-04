import { ApiClientError, parseApiErrorBody } from "./errors";
import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  CreateReactionRequest,
  HealthResponse,
  ReactionSummary,
} from "./types";

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (configured && configured.length > 0 ? configured : "/api/v1").replace(
    /\/$/,
    "",
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const apiError = parseApiErrorBody(payload);
    if (apiError) {
      throw new ApiClientError(response.status, apiError);
    }
    throw new Error(`API request failed with status ${response.status}`);
  }

  return payload as T;
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export function createFeedback(
  body: CreateFeedbackRequest,
): Promise<CreateFeedbackResponse> {
  return request<CreateFeedbackResponse>("/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getArticleReactions(slug: string): Promise<ReactionSummary> {
  return request<ReactionSummary>(
    `/articles/${encodeURIComponent(slug)}/reactions`,
  );
}

export function createArticleReaction(
  slug: string,
  body: CreateReactionRequest,
): Promise<ReactionSummary> {
  return request<ReactionSummary>(
    `/articles/${encodeURIComponent(slug)}/reactions`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
