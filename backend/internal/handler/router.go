package handler

import (
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"orbitforge/backend/internal/middleware"
	"orbitforge/backend/internal/service"
)

type API struct {
	health *service.HealthService
}

func NewAPI(health *service.HealthService) *API {
	return &API{health: health}
}

func (a *API) Handle(req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	requestID := middleware.RequestID(req)
	method := strings.ToUpper(req.RequestContext.HTTP.Method)
	path := normalizePath(req.RawPath)

	if method == "GET" && path == "/api/v1/health" {
		return JSONResponse(200, a.health.Check())
	}

	return ErrorResponse(404, "NOT_FOUND", "route not found", requestID)
}

func normalizePath(path string) string {
	if path == "" {
		return "/"
	}
	if len(path) > 1 && strings.HasSuffix(path, "/") {
		return strings.TrimSuffix(path, "/")
	}
	return path
}
