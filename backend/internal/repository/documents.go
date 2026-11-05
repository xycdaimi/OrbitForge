package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"orbitforge/backend/internal/model"
)

type ObjectClient interface {
	PutObject(ctx context.Context, params *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error)
	GetObject(ctx context.Context, params *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error)
	ListObjectsV2(ctx context.Context, params *s3.ListObjectsV2Input, optFns ...func(*s3.Options)) (*s3.ListObjectsV2Output, error)
	DeleteObject(ctx context.Context, params *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error)
}

type DocumentStore struct {
	client ObjectClient
	bucket string
}

func NewDocumentStore(client ObjectClient, bucket string) *DocumentStore {
	return &DocumentStore{client: client, bucket: bucket}
}

func (s *DocumentStore) SaveDraft(ctx context.Context, doc model.Document) error {
	return s.putPair(ctx, "drafts/"+doc.ID, doc)
}

func (s *DocumentStore) GetDraft(ctx context.Context, id string) (model.Document, error) {
	return s.getPair(ctx, "drafts/"+id)
}

func (s *DocumentStore) ListDrafts(ctx context.Context) ([]model.Document, error) {
	return s.listPrefix(ctx, "drafts/")
}

func (s *DocumentStore) SavePublished(ctx context.Context, doc model.Document) error {
	return s.putPair(ctx, "published/"+doc.Slug, doc)
}

func (s *DocumentStore) DeletePublished(ctx context.Context, slug string) error {
	prefix := "published/" + slug + "/"
	for _, key := range []string{prefix + "document.json", prefix + "body.md"} {
		_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(key),
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *DocumentStore) ListPublished(ctx context.Context) ([]model.Document, error) {
	return s.listPrefix(ctx, "published/")
}

func (s *DocumentStore) PutMedia(ctx context.Context, key string, body []byte, contentType string) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String("media/" + strings.TrimPrefix(key, "media/")),
		Body:        bytes.NewReader(body),
		ContentType: aws.String(contentType),
	})
	return err
}

func (s *DocumentStore) putPair(ctx context.Context, prefix string, doc model.Document) error {
	meta := doc
	meta.Body = ""
	raw, err := json.Marshal(meta)
	if err != nil {
		return err
	}
	if _, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(prefix + "/document.json"),
		Body:        bytes.NewReader(raw),
		ContentType: aws.String("application/json"),
	}); err != nil {
		return err
	}
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(prefix + "/body.md"),
		Body:        bytes.NewReader([]byte(doc.Body)),
		ContentType: aws.String("text/markdown"),
	})
	return err
}

func (s *DocumentStore) getPair(ctx context.Context, prefix string) (model.Document, error) {
	metaOut, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(prefix + "/document.json"),
	})
	if err != nil {
		return model.Document{}, err
	}
	defer metaOut.Body.Close()
	var doc model.Document
	if err := json.NewDecoder(metaOut.Body).Decode(&doc); err != nil {
		return model.Document{}, err
	}
	bodyOut, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(prefix + "/body.md"),
	})
	if err != nil {
		return model.Document{}, err
	}
	defer bodyOut.Body.Close()
	body, err := io.ReadAll(bodyOut.Body)
	if err != nil {
		return model.Document{}, err
	}
	doc.Body = string(body)
	return doc, nil
}

func (s *DocumentStore) listPrefix(ctx context.Context, prefix string) ([]model.Document, error) {
	out, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(prefix),
	})
	if err != nil {
		return nil, err
	}
	var docs []model.Document
	seen := map[string]struct{}{}
	for _, item := range out.Contents {
		key := aws.ToString(item.Key)
		if !strings.HasSuffix(key, "/document.json") {
			continue
		}
		id := strings.TrimSuffix(strings.TrimPrefix(key, prefix), "/document.json")
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		doc, err := s.getPair(ctx, strings.TrimSuffix(key, "/document.json"))
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", key, err)
		}
		docs = append(docs, doc)
	}
	if docs == nil {
		docs = []model.Document{}
	}
	return docs, nil
}
