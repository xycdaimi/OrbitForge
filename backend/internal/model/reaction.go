package model

type ReactionType string

const (
	ReactionUseful     ReactionType = "useful"
	ReactionInsightful ReactionType = "insightful"
)

type ReactionSummary struct {
	ArticleSlug string `json:"articleSlug"`
	Useful      int64  `json:"useful"`
	Insightful  int64  `json:"insightful"`
}

type CreateReactionRequest struct {
	Type ReactionType `json:"type"`
}
