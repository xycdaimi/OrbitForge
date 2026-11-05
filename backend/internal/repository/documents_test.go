package repository

import (
	"bytes"
	"context"
	"io"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"orbitforge/backend/internal/model"
)

type fakeObjectClient struct {
	objects map[string][]byte
}

func newFakeObjectClient() *fakeObjectClient {
	return &fakeObjectClient{objects: map[string][]byte{}}
}

func (f *fakeObjectClient) PutObject(_ context.Context, params *s3.PutObjectInput, _ ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	body, err := io.ReadAll(params.Body)
	if err != nil {
		return nil, err
	}
	f.objects[aws.ToString(params.Key)] = body
	return &s3.PutObjectOutput{}, nil
}

func (f *fakeObjectClient) GetObject(_ context.Context, params *s3.GetObjectInput, _ ...func(*s3.Options)) (*s3.GetObjectOutput, error) {
	body, ok := f.objects[aws.ToString(params.Key)]
	if !ok {
		return nil, errMissing
	}
	return &s3.GetObjectOutput{Body: io.NopCloser(bytes.NewReader(body))}, nil
}

func (f *fakeObjectClient) ListObjectsV2(_ context.Context, params *s3.ListObjectsV2Input, _ ...func(*s3.Options)) (*s3.ListObjectsV2Output, error) {
	prefix := aws.ToString(params.Prefix)
	var contents []types.Object
	for key := range f.objects {
		if strings.HasPrefix(key, prefix) {
			contents = append(contents, types.Object{Key: aws.String(key)})
		}
	}
	return &s3.ListObjectsV2Output{Contents: contents}, nil
}

func (f *fakeObjectClient) DeleteObject(_ context.Context, params *s3.DeleteObjectInput, _ ...func(*s3.Options)) (*s3.DeleteObjectOutput, error) {
	delete(f.objects, aws.ToString(params.Key))
	return &s3.DeleteObjectOutput{}, nil
}

var errMissing = errString("missing object")

type errString string

func (e errString) Error() string { return string(e) }

func TestDocumentStoreRoundTrip(t *testing.T) {
	store := NewDocumentStore(newFakeObjectClient(), "content")
	doc := model.Document{
		ID: "doc1", Slug: "hello-world", Title: "Hello", Description: "d",
		Status: model.StatusDraft, Category: "Programming", Tags: []string{"Go"}, Body: "# Hi",
	}
	if err := store.SaveDraft(context.Background(), doc); err != nil {
		t.Fatal(err)
	}
	got, err := store.GetDraft(context.Background(), "doc1")
	if err != nil {
		t.Fatal(err)
	}
	if got.Body != "# Hi" || got.Title != "Hello" {
		t.Fatalf("unexpected draft: %+v", got)
	}
	list, err := store.ListDrafts(context.Background())
	if err != nil || len(list) != 1 {
		t.Fatalf("list=%v err=%v", list, err)
	}
	doc.Status = model.StatusPublished
	if err := store.SavePublished(context.Background(), doc); err != nil {
		t.Fatal(err)
	}
	if err := store.DeletePublished(context.Background(), doc.Slug); err != nil {
		t.Fatal(err)
	}
	published, err := store.ListPublished(context.Background())
	if err != nil || len(published) != 0 {
		t.Fatalf("published=%v err=%v", published, err)
	}
}
