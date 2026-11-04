package handler

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"orbitforge/backend/internal/middleware"
	"orbitforge/backend/internal/model"
	"orbitforge/backend/internal/service"
)

type API struct {
	health    *service.HealthService
	feedback  *service.FeedbackService
	reactions *service.ReactionService
}

func NewAPI(
	health *service.HealthService,
	feedback *service.FeedbackService,
	reactions *service.ReactionService,
) *API {
	return &API{
		health:    health,
		feedback:  feedback,
		reactions: reactions,
	}
}

func (a *API) Handle(req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	requestID := middleware.RequestID(req)
	method := strings.ToUpper(req.RequestContext.HTTP.Method)
	path := normalizePath(req.RawPath)

	switch {
	case method == "GET" && path == "/api/v1/health":
		return JSONResponse(200, a.health.Check())
	case method == "POST" && path == "/api/v1/feedback":
		return a.handleCreateFeedback(req, requestID)
	case method == "GET" && strings.HasPrefix(path, "/api/v1/articles/") && strings.HasSuffix(path, "/reactions"):
		slug, ok := extractReactionSlug(path)
		if !ok {
			return ErrorResponse(404, "NOT_FOUND", "route not found", requestID)
		}
		return a.handleGetReactions(slug, requestID)
	case method == "POST" && strings.HasPrefix(path, "/api/v1/articles/") && strings.HasSuffix(path, "/reactions"):
		slug, ok := extractReactionSlug(path)
		if !ok {
			return ErrorResponse(404, "NOT_FOUND", "route not found", requestID)
		}
		return a.handleCreateReaction(slug, req, requestID)
	default:
		return ErrorResponse(404, "NOT_FOUND", "route not found", requestID)
	}
}

func (a *API) handleCreateFeedback(req events.APIGatewayV2HTTPRequest, requestID string) (events.APIGatewayV2HTTPResponse, error) {
	if len(req.Body) > 8*1024 {
		return ErrorResponse(400, "INVALID_ARGUMENT", "request body too large", requestID)
	}

	var payload model.CreateFeedbackRequest
	if err := json.Unmarshal([]byte(req.Body), &payload); err != nil {
		return ErrorResponse(400, "INVALID_ARGUMENT", "invalid JSON body", requestID)
	}

	result, err := a.feedback.Create(payload)
	if err != nil {
		return mapServiceError(err, requestID)
	}
	return JSONResponse(201, result)
}

func (a *API) handleGetReactions(slug, requestID string) (events.APIGatewayV2HTTPResponse, error) {
	result, err := a.reactions.Get(slug)
	if err != nil {
		return mapServiceError(err, requestID)
	}
	return JSONResponse(200, result)
}

func (a *API) handleCreateReaction(slug string, req events.APIGatewayV2HTTPRequest, requestID string) (events.APIGatewayV2HTTPResponse, error) {
	if len(req.Body) > 2*1024 {
		return ErrorResponse(400, "INVALID_ARGUMENT", "request body too large", requestID)
	}

	var payload model.CreateReactionRequest
	if err := json.Unmarshal([]byte(req.Body), &payload); err != nil {
		return ErrorResponse(400, "INVALID_ARGUMENT", "invalid JSON body", requestID)
	}

	result, err := a.reactions.Create(slug, payload)
	if err != nil {
		return mapServiceError(err, requestID)
	}
	return JSONResponse(200, result)
}

func mapServiceError(err error, requestID string) (events.APIGatewayV2HTTPResponse, error) {
	if errors.Is(err, service.ErrInvalidArgument) {
		return ErrorResponse(400, "INVALID_ARGUMENT", err.Error(), requestID)
	}
	return ErrorResponse(500, "INTERNAL", "internal server error", requestID)
}

func extractReactionSlug(path string) (string, bool) {
	const prefix = "/api/v1/articles/"
	const suffix = "/reactions"
	if !strings.HasPrefix(path, prefix) || !strings.HasSuffix(path, suffix) {
		return "", false
	}
	slug := strings.TrimSuffix(strings.TrimPrefix(path, prefix), suffix)
	slug = strings.Trim(slug, "/")
	if slug == "" || strings.Contains(slug, "/") {
		return "", false
	}
	return slug, true
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
