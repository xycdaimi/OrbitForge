package service

import (
	"context"
	"errors"
	"regexp"
	"strings"
	"time"

	"orbitforge/backend/internal/model"
)

var documentSlugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

var ErrNotFound = errors.New("not found")

type DocumentRepository interface {
	SaveDraft(ctx context.Context, doc model.Document) error
	GetDraft(ctx context.Context, id string) (model.Document, error)
	ListDrafts(ctx context.Context) ([]model.Document, error)
	SavePublished(ctx context.Context, doc model.Document) error
	DeletePublished(ctx context.Context, slug string) error
	ListPublished(ctx context.Context) ([]model.Document, error)
	PutMedia(ctx context.Context, key string, body []byte, contentType string) error
}

type DocumentService struct {
	repo  DocumentRepository
	now   func() time.Time
	newID func() string
}

func NewDocumentService(repo DocumentRepository, now func() time.Time, newID func() string) *DocumentService {
	return &DocumentService{repo: repo, now: now, newID: newID}
}

type SaveDraftInput struct {
	ID          string
	Title       string
	Slug        string
	Description string
	Category    string
	Tags        []string
	Series      string
	CoverKey    string
	Body        string
}

func (s *DocumentService) CreateDraft(ctx context.Context, in SaveDraftInput) (model.Document, error) {
	doc, err := s.normalize(in, model.StatusDraft)
	if err != nil {
		return model.Document{}, err
	}
	doc.ID = s.newID()
	stamp := s.now().UTC().Format(time.RFC3339)
	doc.CreatedAt = stamp
	doc.UpdatedAt = stamp
	if err := s.repo.SaveDraft(ctx, doc); err != nil {
		return model.Document{}, err
	}
	return doc, nil
}

func (s *DocumentService) UpdateDraft(ctx context.Context, in SaveDraftInput) (model.Document, error) {
	if strings.TrimSpace(in.ID) == "" {
		return model.Document{}, ErrInvalidArgument
	}
	current, err := s.repo.GetDraft(ctx, in.ID)
	if err != nil {
		return model.Document{}, err
	}
	doc, err := s.normalize(in, model.StatusDraft)
	if err != nil {
		return model.Document{}, err
	}
	doc.ID = current.ID
	doc.CreatedAt = current.CreatedAt
	doc.UpdatedAt = s.now().UTC().Format(time.RFC3339)
	doc.PublishedAt = current.PublishedAt
	if err := s.repo.SaveDraft(ctx, doc); err != nil {
		return model.Document{}, err
	}
	return doc, nil
}

func (s *DocumentService) GetDraft(ctx context.Context, id string) (model.Document, error) {
	if strings.TrimSpace(id) == "" {
		return model.Document{}, ErrInvalidArgument
	}
	return s.repo.GetDraft(ctx, id)
}

func (s *DocumentService) ListDrafts(ctx context.Context) ([]model.Document, error) {
	return s.repo.ListDrafts(ctx)
}

func (s *DocumentService) SaveMedia(ctx context.Context, filename, contentType string, body []byte) (string, error) {
	if len(body) == 0 || len(body) > 2*1024*1024 {
		return "", ErrInvalidArgument
	}
	switch contentType {
	case "image/png", "image/jpeg", "image/webp", "image/gif":
	default:
		return "", ErrInvalidArgument
	}
	safe := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '.' || r == '-' {
			return r
		}
		return '-'
	}, strings.ToLower(filename))
	key := s.newID() + "-" + safe
	if err := s.repo.PutMedia(ctx, key, body, contentType); err != nil {
		return "", err
	}
	return "media/" + key, nil
}

func (s *DocumentService) normalize(in SaveDraftInput, status model.DocumentStatus) (model.Document, error) {
	title := strings.TrimSpace(in.Title)
	slug := strings.TrimSpace(in.Slug)
	description := strings.TrimSpace(in.Description)
	category := strings.TrimSpace(in.Category)
	if title == "" || description == "" || category == "" || !documentSlugPattern.MatchString(slug) {
		return model.Document{}, ErrInvalidArgument
	}
	if len(in.Tags) == 0 {
		return model.Document{}, ErrInvalidArgument
	}
	tags := make([]string, 0, len(in.Tags))
	for _, tag := range in.Tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			return model.Document{}, ErrInvalidArgument
		}
		tags = append(tags, tag)
	}
	return model.Document{
		ID:          in.ID,
		Slug:        slug,
		Title:       title,
		Description: description,
		Status:      status,
		Category:    category,
		Tags:        tags,
		Series:      strings.TrimSpace(in.Series),
		CoverKey:    strings.TrimSpace(in.CoverKey),
		Body:        in.Body,
	}, nil
}
