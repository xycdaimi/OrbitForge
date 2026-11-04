package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"orbitforge/backend/internal/handler"
	"orbitforge/backend/internal/repository"
	"orbitforge/backend/internal/service"
)

func main() {
	feedbackRepo, reactionRepo := newRepositories()
	api := handler.NewAPI(
		service.NewHealthService(),
		service.NewFeedbackService(feedbackRepo, newID),
		service.NewReactionService(reactionRepo),
	)
	lambda.Start(api.Handle)
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
