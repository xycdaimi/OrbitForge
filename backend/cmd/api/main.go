package main

import (
	"crypto/rand"
	"encoding/hex"

	"github.com/aws/aws-lambda-go/lambda"
	"orbitforge/backend/internal/handler"
	"orbitforge/backend/internal/repository"
	"orbitforge/backend/internal/service"
)

func main() {
	store := repository.NewMemoryStore()
	api := handler.NewAPI(
		service.NewHealthService(),
		service.NewFeedbackService(store, newID),
		service.NewReactionService(store),
	)
	lambda.Start(api.Handle)
}

func newID() string {
	buf := make([]byte, 16)
	_, _ = rand.Read(buf)
	return hex.EncodeToString(buf)
}
