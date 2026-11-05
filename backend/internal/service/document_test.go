package service

import (
	"context"
	"testing"
	"time"

	"orbitforge/backend/internal/model"
)

type memDocs struct {
	drafts map[string]model.Document
}

func (m *memDocs) SaveDraft(_ context.Context, doc model.Document) error {
	if m.drafts == nil {
		m.drafts = map[string]model.Document{}
	}
	m.drafts[doc.ID] = doc
	return nil
}
func (m *memDocs) GetDraft(_ context.Context, id string) (model.Document, error) {
	doc, ok := m.drafts[id]
	if !ok {
		return model.Document{}, ErrNotFound
	}
	return doc, nil
}
func (m *memDocs) ListDrafts(context.Context) ([]model.Document, error) { return nil, nil }
func (m *memDocs) SavePublished(context.Context, model.Document) error  { return nil }
func (m *memDocs) DeletePublished(context.Context, string) error        { return nil }
func (m *memDocs) ListPublished(context.Context) ([]model.Document, error) {
	return nil, nil
}
func (m *memDocs) PutMedia(context.Context, string, []byte, string) error { return nil }

func TestCreateDraftRejectsBadSlug(t *testing.T) {
	svc := NewDocumentService(&memDocs{}, func() time.Time { return time.Unix(0, 0).UTC() }, func() string { return "id1" })
	_, err := svc.CreateDraft(context.Background(), SaveDraftInput{
		Title: "T", Slug: "Bad Slug", Description: "d", Category: "Programming", Tags: []string{"Go"},
	})
	if err == nil {
		t.Fatal("expected invalid slug")
	}
}

func TestCreateDraftStoresBody(t *testing.T) {
	repo := &memDocs{}
	svc := NewDocumentService(repo, func() time.Time { return time.Unix(10, 0).UTC() }, func() string { return "id1" })
	doc, err := svc.CreateDraft(context.Background(), SaveDraftInput{
		Title: "Hello", Slug: "hello", Description: "d", Category: "Programming", Tags: []string{"Go"}, Body: "body",
	})
	if err != nil {
		t.Fatal(err)
	}
	if doc.ID != "id1" || repo.drafts["id1"].Body != "body" || doc.Status != model.StatusDraft {
		t.Fatalf("%+v", doc)
	}
}
