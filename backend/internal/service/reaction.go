package service

import (
	"fmt"
	"strings"

	"orbitforge/backend/internal/model"
	"orbitforge/backend/internal/repository"
)

type ReactionService struct {
	repo repository.ReactionRepository
}

func NewReactionService(repo repository.ReactionRepository) *ReactionService {
	return &ReactionService{repo: repo}
}

func (s *ReactionService) Get(slug string) (model.ReactionSummary, error) {
	normalized := strings.TrimSpace(slug)
	if !slugPattern.MatchString(normalized) {
		return model.ReactionSummary{}, fmt.Errorf("%w: invalid article slug", ErrInvalidArgument)
	}
	return s.repo.GetReactions(normalized)
}

func (s *ReactionService) Create(slug string, req model.CreateReactionRequest) (model.ReactionSummary, error) {
	normalized := strings.TrimSpace(slug)
	if !slugPattern.MatchString(normalized) {
		return model.ReactionSummary{}, fmt.Errorf("%w: invalid article slug", ErrInvalidArgument)
	}
	if req.Type != model.ReactionUseful && req.Type != model.ReactionInsightful {
		return model.ReactionSummary{}, fmt.Errorf("%w: type must be useful or insightful", ErrInvalidArgument)
	}
	return s.repo.IncrementReaction(normalized, req.Type)
}
