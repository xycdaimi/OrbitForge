package repository

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"orbitforge/backend/internal/model"
)

type DynamoClient interface {
	PutItem(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error)
	GetItem(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error)
	UpdateItem(ctx context.Context, params *dynamodb.UpdateItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.UpdateItemOutput, error)
}

type DynamoStore struct {
	client         DynamoClient
	feedbackTable  string
	reactionsTable string
	timeout        time.Duration
}

func NewDynamoStore(client DynamoClient, feedbackTable, reactionsTable string) *DynamoStore {
	return &DynamoStore{
		client:         client,
		feedbackTable:  feedbackTable,
		reactionsTable: reactionsTable,
		timeout:        5 * time.Second,
	}
}

func NewDynamoStoreFromEnv(client DynamoClient) *DynamoStore {
	feedbackTable := envOr("FEEDBACK_TABLE", "OrbitForgeFeedback")
	reactionsTable := envOr("REACTIONS_TABLE", "OrbitForgeReactions")
	return NewDynamoStore(client, feedbackTable, reactionsTable)
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func (s *DynamoStore) CreateFeedback(feedback model.Feedback) error {
	ctx, cancel := context.WithTimeout(context.Background(), s.timeout)
	defer cancel()

	item := map[string]types.AttributeValue{
		"feedbackId":  &types.AttributeValueMemberS{Value: feedback.ID},
		"articleSlug": &types.AttributeValueMemberS{Value: feedback.ArticleSlug},
		"message":     &types.AttributeValueMemberS{Value: feedback.Message},
	}
	if feedback.Email != "" {
		item["email"] = &types.AttributeValueMemberS{Value: feedback.Email}
	}

	_, err := s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.feedbackTable),
		Item:      item,
	})
	if err != nil {
		return fmt.Errorf("put feedback: %w", err)
	}
	return nil
}

func (s *DynamoStore) GetReactions(slug string) (model.ReactionSummary, error) {
	ctx, cancel := context.WithTimeout(context.Background(), s.timeout)
	defer cancel()

	out, err := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(s.reactionsTable),
		Key: map[string]types.AttributeValue{
			"articleSlug": &types.AttributeValueMemberS{Value: slug},
		},
	})
	if err != nil {
		return model.ReactionSummary{}, fmt.Errorf("get reactions: %w", err)
	}
	if nullItem(out.Item) {
		return model.ReactionSummary{ArticleSlug: slug}, nil
	}

	return model.ReactionSummary{
		ArticleSlug: slug,
		Useful:      attrInt(out.Item, "useful"),
		Insightful:  attrInt(out.Item, "insightful"),
	}, nil
}

func (s *DynamoStore) IncrementReaction(slug string, reaction model.ReactionType) (model.ReactionSummary, error) {
	ctx, cancel := context.WithTimeout(context.Background(), s.timeout)
	defer cancel()

	field := string(reaction)
	out, err := s.client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(s.reactionsTable),
		Key: map[string]types.AttributeValue{
			"articleSlug": &types.AttributeValueMemberS{Value: slug},
		},
		UpdateExpression: aws.String("ADD #field :one"),
		ExpressionAttributeNames: map[string]string{
			"#field": field,
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":one": &types.AttributeValueMemberN{Value: "1"},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		return model.ReactionSummary{}, fmt.Errorf("increment reaction: %w", err)
	}

	return model.ReactionSummary{
		ArticleSlug: slug,
		Useful:      attrInt(out.Attributes, "useful"),
		Insightful:  attrInt(out.Attributes, "insightful"),
	}, nil
}

func nullItem(item map[string]types.AttributeValue) bool {
	return item == nil || len(item) == 0
}

func attrInt(item map[string]types.AttributeValue, key string) int64 {
	raw, ok := item[key]
	if !ok {
		return 0
	}
	number, ok := raw.(*types.AttributeValueMemberN)
	if !ok {
		return 0
	}
	value, err := strconv.ParseInt(number.Value, 10, 64)
	if err != nil {
		return 0
	}
	return value
}
