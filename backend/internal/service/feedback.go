package service

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf8"

	"orbitforge/backend/internal/model"
	"orbitforge/backend/internal/repository"
)

var (
	ErrInvalidArgument = errors.New("invalid argument")
	slugPattern        = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	emailPattern       = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)
)

type FeedbackService struct {
	repo repository.FeedbackRepository
	newID func() string
}

func NewFeedbackService(repo repository.FeedbackRepository, newID func() string) *FeedbackService {
	return &FeedbackService{repo: repo, newID: newID}
}

func (s *FeedbackService) Create(req model.CreateFeedbackRequest) (model.CreateFeedbackResponse, error) {
	slug := strings.TrimSpace(req.ArticleSlug)
	message := strings.TrimSpace(req.Message)
	email := strings.TrimSpace(req.Email)

	if !slugPattern.MatchString(slug) {
		return model.CreateFeedbackResponse{}, fmt.Errorf("%w: invalid articleSlug", ErrInvalidArgument)
	}
	if message == "" || utf8.RuneCountInString(message) > 2000 {
		return model.CreateFeedbackResponse{}, fmt.Errorf("%w: message must be 1-2000 characters", ErrInvalidArgument)
	}
	if email != "" && !emailPattern.MatchString(email) {
		return model.CreateFeedbackResponse{}, fmt.Errorf("%w: invalid email", ErrInvalidArgument)
	}

	id := s.newID()
	err := s.repo.CreateFeedback(model.Feedback{
		ID:          id,
		ArticleSlug: slug,
		Message:     message,
		Email:       email,
	})
	if err != nil {
		return model.CreateFeedbackResponse{}, err
	}

	return model.CreateFeedbackResponse{ID: id}, nil
}
