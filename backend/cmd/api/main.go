package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"orbitforge/backend/internal/handler"
	"orbitforge/backend/internal/service"
)

func main() {
	api := handler.NewAPI(service.NewHealthService())
	lambda.Start(api.Handle)
}
