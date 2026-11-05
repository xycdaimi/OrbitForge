package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"orbitforge/backend/internal/handler"
	"orbitforge/backend/internal/middleware"
	"orbitforge/backend/internal/repository"
	"orbitforge/backend/internal/service"
)

func main() {
	feedbackRepo, reactionRepo := newRepositories()
	docs := newDocumentService()
	api := handler.NewAPI(
		service.NewHealthService(),
		service.NewFeedbackService(feedbackRepo, newID),
		service.NewReactionService(reactionRepo),
		docs,
	)
	if poolID := strings.TrimSpace(os.Getenv("COGNITO_USER_POOL_ID")); poolID != "" {
		region := strings.TrimSpace(os.Getenv("AWS_REGION"))
		if region == "" {
			region = strings.TrimSpace(os.Getenv("AWS_DEFAULT_REGION"))
		}
		if region == "" {
			region = "us-west-2"
		}
		api.SetAuthorizer(middleware.NewCognitoAuthorizer(
			region,
			poolID,
			strings.TrimSpace(os.Getenv("COGNITO_CLIENT_ID")),
		))
	}
	lambda.Start(api.Handle)
}

func newDocumentService() *service.DocumentService {
	bucket := strings.TrimSpace(os.Getenv("CONTENT_BUCKET"))
	if bucket == "" {
		return nil
	}
	cfg, err := awsconfig.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("load aws config: %v", err)
	}
	store := repository.NewDocumentStore(s3.NewFromConfig(cfg), bucket)
	return service.NewDocumentService(store, time.Now, newID)
}

func newRepositories() (repository.FeedbackRepository, repository.ReactionRepository) {
	mode := strings.ToLower(strings.TrimSpace(os.Getenv("REPOSITORY")))
	if mode != "dynamodb" {
		store := repository.NewMemoryStore()
		return store, store
	}

	cfg, err := awsconfig.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("load aws config: %v", err)
	}
	store := repository.NewDynamoStoreFromEnv(dynamodb.NewFromConfig(cfg))
	return store, store
}

func newID() string {
	buf := make([]byte, 16)
	_, _ = rand.Read(buf)
	return hex.EncodeToString(buf)
}
