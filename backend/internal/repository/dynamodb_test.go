package repository_test

import (
	"context"
	"strconv"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"orbitforge/backend/internal/model"
	"orbitforge/backend/internal/repository"
)

type fakeDynamo struct {
	feedback  map[string]map[string]types.AttributeValue
	reactions map[string]map[string]types.AttributeValue
}

func newFakeDynamo() *fakeDynamo {
	return &fakeDynamo{
		feedback:  map[string]map[string]types.AttributeValue{},
		reactions: map[string]map[string]types.AttributeValue{},
	}
}

func (f *fakeDynamo) PutItem(_ context.Context, params *dynamodb.PutItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
	idAttr := params.Item["feedbackId"].(*types.AttributeValueMemberS)
	f.feedback[idAttr.Value] = params.Item
	return &dynamodb.PutItemOutput{}, nil
}

func (f *fakeDynamo) GetItem(_ context.Context, params *dynamodb.GetItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
	slug := params.Key["articleSlug"].(*types.AttributeValueMemberS).Value
	item, ok := f.reactions[slug]
	if !ok {
		return &dynamodb.GetItemOutput{}, nil
	}
	return &dynamodb.GetItemOutput{Item: item}, nil
}

func (f *fakeDynamo) UpdateItem(_ context.Context, params *dynamodb.UpdateItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.UpdateItemOutput, error) {
	slug := params.Key["articleSlug"].(*types.AttributeValueMemberS).Value
	item, ok := f.reactions[slug]
	if !ok {
		item = map[string]types.AttributeValue{
			"articleSlug": &types.AttributeValueMemberS{Value: slug},
		}
	}
	field := params.ExpressionAttributeNames["#field"]
	current := int64(0)
	if raw, exists := item[field]; exists {
		current, _ = strconv.ParseInt(raw.(*types.AttributeValueMemberN).Value, 10, 64)
	}
	item[field] = &types.AttributeValueMemberN{Value: strconv.FormatInt(current+1, 10)}
	f.reactions[slug] = item
	return &dynamodb.UpdateItemOutput{Attributes: item}, nil
}

func TestDynamoStoreFeedbackAndReactions(t *testing.T) {
	t.Parallel()

	fake := newFakeDynamo()
	store := repository.NewDynamoStore(fake, "OrbitForgeFeedback", "OrbitForgeReactions")

	if err := store.CreateFeedback(model.Feedback{
		ID:          "fb-1",
		ArticleSlug: "go-lambda-api-boundary",
		Message:     "有帮助",
	}); err != nil {
		t.Fatalf("CreateFeedback: %v", err)
	}
	if _, ok := fake.feedback["fb-1"]; !ok {
		t.Fatal("expected feedback item stored")
	}

	summary, err := store.IncrementReaction("go-lambda-api-boundary", model.ReactionUseful)
	if err != nil {
		t.Fatalf("IncrementReaction: %v", err)
	}
	if summary.Useful != 1 {
		t.Fatalf("useful = %d, want 1", summary.Useful)
	}

	got, err := store.GetReactions("go-lambda-api-boundary")
	if err != nil {
		t.Fatalf("GetReactions: %v", err)
	}
	if got.Useful != 1 {
		t.Fatalf("get useful = %d, want 1", got.Useful)
	}
}
