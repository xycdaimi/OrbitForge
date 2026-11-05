package service

import (
	"context"
	"time"

	"orbitforge/backend/internal/model"
)

type BuildRunner interface {
	Start(ctx context.Context) (string, error)
	Status(ctx context.Context, id string) (string, error)
}

type PublishResult struct {
	JobID  string `json:"jobId"`
	Status string `json:"status"`
	Slug   string `json:"slug"`
}

func (s *DocumentService) Publish(ctx context.Context, id string, runner BuildRunner) (PublishResult, error) {
	doc, err := s.GetDraft(ctx, id)
	if err != nil {
		return PublishResult{}, err
	}
	doc.Status = model.StatusDraft
	doc.PublishedAt = ""
	if err := s.repo.SaveDraft(ctx, doc); err != nil {
		return PublishResult{}, err
	}
	published := doc
	published.Status = model.StatusPublished
	published.PublishedAt = s.now().UTC().Format(time.RFC3339)
	if err := s.repo.SavePublished(ctx, published); err != nil {
		return PublishResult{}, err
	}
	jobID, err := runner.Start(ctx)
	if err != nil {
		return PublishResult{}, err
	}
	return PublishResult{JobID: jobID, Status: "IN_PROGRESS", Slug: doc.Slug}, nil
}

func (s *DocumentService) Unpublish(ctx context.Context, id string, runner BuildRunner) (PublishResult, error) {
	doc, err := s.GetDraft(ctx, id)
	if err != nil {
		return PublishResult{}, err
	}
	if err := s.repo.DeletePublished(ctx, doc.Slug); err != nil {
		return PublishResult{}, err
	}
	doc.Status = model.StatusDraft
	doc.PublishedAt = ""
	if err := s.repo.SaveDraft(ctx, doc); err != nil {
		return PublishResult{}, err
	}
	jobID, err := runner.Start(ctx)
	if err != nil {
		return PublishResult{}, err
	}
	return PublishResult{JobID: jobID, Status: "IN_PROGRESS", Slug: doc.Slug}, nil
}

func (s *DocumentService) MarkPublishedIfJobSucceeded(ctx context.Context, id, jobID string, runner BuildRunner) (PublishResult, error) {
	status, err := runner.Status(ctx, jobID)
	if err != nil {
		return PublishResult{}, err
	}
	doc, err := s.GetDraft(ctx, id)
	if err != nil {
		return PublishResult{}, err
	}
	if status == "SUCCEEDED" {
		doc.Status = model.StatusPublished
		if doc.PublishedAt == "" {
			doc.PublishedAt = s.now().UTC().Format(time.RFC3339)
		}
		if err := s.repo.SaveDraft(ctx, doc); err != nil {
			return PublishResult{}, err
		}
	}
	return PublishResult{JobID: jobID, Status: status, Slug: doc.Slug}, nil
}
