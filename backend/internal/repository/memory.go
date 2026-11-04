package repository

import (
	"sync"

	"orbitforge/backend/internal/model"
)

type MemoryStore struct {
	mu        sync.Mutex
	feedback  []model.Feedback
	reactions map[string]model.ReactionSummary
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		feedback:  make([]model.Feedback, 0),
		reactions: make(map[string]model.ReactionSummary),
	}
}

func (s *MemoryStore) CreateFeedback(feedback model.Feedback) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.feedback = append(s.feedback, feedback)
	return nil
}

func (s *MemoryStore) IncrementReaction(slug string, reaction model.ReactionType) (model.ReactionSummary, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	summary := s.reactions[slug]
	summary.ArticleSlug = slug
	switch reaction {
	case model.ReactionUseful:
		summary.Useful++
	case model.ReactionInsightful:
		summary.Insightful++
	}
	s.reactions[slug] = summary
	return summary, nil
}

func (s *MemoryStore) GetReactions(slug string) (model.ReactionSummary, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	summary, ok := s.reactions[slug]
	if !ok {
		return model.ReactionSummary{ArticleSlug: slug}, nil
	}
	summary.ArticleSlug = slug
	return summary, nil
}
