package handler

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"orbitforge/backend/internal/middleware"
	"orbitforge/backend/internal/service"
)

func (a *API) handleStudio(req events.APIGatewayV2HTTPRequest, method, path, requestID string) (events.APIGatewayV2HTTPResponse, bool, error) {
	if path != "/api/v1/studio/documents" && path != "/api/v1/studio/media" && !strings.HasPrefix(path, "/api/v1/studio/documents/") && !strings.HasPrefix(path, "/api/v1/studio/publish-jobs/") {
		return events.APIGatewayV2HTTPResponse{}, false, nil
	}
	if _, err := a.authorSubject(req); err != nil {
		resp, _ := ErrorResponse(401, "UNAUTHENTICATED", "login required", requestID)
		return resp, true, nil
	}
	if a.docs == nil {
		resp, _ := ErrorResponse(503, "UNAVAILABLE", "content store is not configured", requestID)
		return resp, true, nil
	}
	ctx := context.Background()

	switch {
	case method == "GET" && path == "/api/v1/studio/documents":
		docs, err := a.docs.ListDrafts(ctx)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(200, map[string]any{"documents": docs})
		return resp, true, nil
	case method == "POST" && path == "/api/v1/studio/documents":
		var input service.SaveDraftInput
		if err := json.Unmarshal([]byte(req.Body), &input); err != nil {
			resp, _ := ErrorResponse(400, "INVALID_ARGUMENT", "invalid JSON body", requestID)
			return resp, true, nil
		}
		doc, err := a.docs.CreateDraft(ctx, input)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(201, doc)
		return resp, true, nil
	case method == "GET" && strings.HasPrefix(path, "/api/v1/studio/documents/"):
		id := strings.TrimPrefix(path, "/api/v1/studio/documents/")
		doc, err := a.docs.GetDraft(ctx, id)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(200, doc)
		return resp, true, nil
	case method == "PUT" && strings.HasPrefix(path, "/api/v1/studio/documents/"):
		var input service.SaveDraftInput
		if err := json.Unmarshal([]byte(req.Body), &input); err != nil {
			resp, _ := ErrorResponse(400, "INVALID_ARGUMENT", "invalid JSON body", requestID)
			return resp, true, nil
		}
		input.ID = strings.TrimPrefix(path, "/api/v1/studio/documents/")
		doc, err := a.docs.UpdateDraft(ctx, input)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(200, doc)
		return resp, true, nil
	case method == "POST" && strings.HasSuffix(path, "/publish"):
		id := strings.TrimSuffix(strings.TrimPrefix(path, "/api/v1/studio/documents/"), "/publish")
		if a.builds == nil {
			resp, _ := ErrorResponse(503, "UNAVAILABLE", "publisher is not configured", requestID)
			return resp, true, nil
		}
		result, err := a.docs.Publish(ctx, id, a.builds)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(202, result)
		return resp, true, nil
	case method == "POST" && strings.HasSuffix(path, "/unpublish"):
		id := strings.TrimSuffix(strings.TrimPrefix(path, "/api/v1/studio/documents/"), "/unpublish")
		if a.builds == nil {
			resp, _ := ErrorResponse(503, "UNAVAILABLE", "publisher is not configured", requestID)
			return resp, true, nil
		}
		result, err := a.docs.Unpublish(ctx, id, a.builds)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(202, result)
		return resp, true, nil
	case method == "GET" && strings.HasPrefix(path, "/api/v1/studio/publish-jobs/"):
		jobID := strings.TrimPrefix(path, "/api/v1/studio/publish-jobs/")
		docID := req.QueryStringParameters["documentId"]
		if a.builds == nil || docID == "" {
			resp, _ := ErrorResponse(400, "INVALID_ARGUMENT", "documentId is required", requestID)
			return resp, true, nil
		}
		result, err := a.docs.MarkPublishedIfJobSucceeded(ctx, docID, jobID, a.builds)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(200, result)
		return resp, true, nil
	case method == "POST" && path == "/api/v1/studio/media":
		var payload struct {
			Filename    string `json:"filename"`
			ContentType string `json:"contentType"`
			DataBase64  string `json:"dataBase64"`
		}
		if err := json.Unmarshal([]byte(req.Body), &payload); err != nil {
			resp, _ := ErrorResponse(400, "INVALID_ARGUMENT", "invalid JSON body", requestID)
			return resp, true, nil
		}
		raw, err := base64.StdEncoding.DecodeString(payload.DataBase64)
		if err != nil {
			resp, _ := ErrorResponse(400, "INVALID_ARGUMENT", "invalid image data", requestID)
			return resp, true, nil
		}
		key, err := a.docs.SaveMedia(ctx, payload.Filename, payload.ContentType, raw)
		if err != nil {
			resp, _ := mapServiceError(err, requestID)
			return resp, true, nil
		}
		resp, _ := JSONResponse(201, map[string]string{"key": key})
		return resp, true, nil
	default:
		resp, _ := ErrorResponse(404, "NOT_FOUND", "route not found", requestID)
		return resp, true, nil
	}
}

func (a *API) authorSubject(req events.APIGatewayV2HTTPRequest) (string, error) {
	header := req.Headers["authorization"]
	if header == "" {
		header = req.Headers["Authorization"]
	}
	return middleware.SubjectFromAuthorization(a.auth, header)
}
