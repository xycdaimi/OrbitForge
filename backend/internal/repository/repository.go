package repository

import "orbitforge/backend/internal/model"

type FeedbackRepository interface {
	CreateFeedback(feedback model.Feedback) error
}

type ReactionRepository interface {
	IncrementReaction(slug string, reaction model.ReactionType) (model.ReactionSummary, error)
	GetReactions(slug string) (model.ReactionSummary, error)
}
