package service

import (
	"context"
	"testing"
	"time"

	"orbitforge/backend/internal/model"
)

type fakeRunner struct {
	id     string
	status string
	err    error
}

func (f fakeRunner) Start(context.Context) (string, error) { return f.id, f.err }
func (f fakeRunner) Status(context.Context, string) (string, error) {
	return f.status, nil
}

func TestPublishKeepsDraftUntilBuildSucceeds(t *testing.T) {
	repo := &memDocs{}
	svc := NewDocumentService(repo, func() time.Time { return time.Unix(20, 0).UTC() }, func() string { return "id1" })
	doc, err := svc.CreateDraft(context.Background(), SaveDraftInput{
		Title: "Hello", Slug: "hello", Description: "d", Category: "Programming", Tags: []string{"Go"}, Body: "x",
	})
	if err != nil {
		t.Fatal(err)
	}
	result, err := svc.Publish(context.Background(), doc.ID, fakeRunner{id: "job-1"})
	if err != nil {
		t.Fatal(err)
	}
	if repo.drafts[doc.ID].Status != model.StatusDraft || result.JobID != "job-1" {
		t.Fatalf("draft status changed too early: %+v", repo.drafts[doc.ID])
	}
	done, err := svc.MarkPublishedIfJobSucceeded(context.Background(), doc.ID, "job-1", fakeRunner{status: "SUCCEEDED"})
	if err != nil || done.Status != "SUCCEEDED" || repo.drafts[doc.ID].Status != model.StatusPublished {
		t.Fatalf("done=%+v doc=%+v err=%v", done, repo.drafts[doc.ID], err)
	}
}
