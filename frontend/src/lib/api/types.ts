export type ApiErrorBody = {
  code: string;
  message: string;
  requestId: string;
};

export type HealthResponse = {
  status: string;
};

export type CreateFeedbackRequest = {
  articleSlug: string;
  message: string;
  email?: string;
};

export type CreateFeedbackResponse = {
  id: string;
};

export type ReactionType = "useful" | "insightful";

export type ReactionSummary = {
  articleSlug: string;
  useful: number;
  insightful: number;
};

export type CreateReactionRequest = {
  type: ReactionType;
};
