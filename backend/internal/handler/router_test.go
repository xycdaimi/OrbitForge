package handler_test

import (
	"encoding/json"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"orbitforge/backend/internal/handler"
	"orbitforge/backend/internal/model"
	"orbitforge/backend/internal/service"
)

func TestHealthOK(t *testing.T) {
	t.Parallel()

	api := handler.NewAPI(service.NewHealthService())
	resp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/health",
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-health",
			HTTP: events.APIGatewayV2HTTPRequestContextHTTPDescription{
				Method: "GET",
			},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("status = %d, want 200", resp.StatusCode)
	}

	var body model.HealthResponse
	if err := json.Unmarshal([]byte(resp.Body), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if body.Status != "ok" {
		t.Fatalf("status payload = %q, want ok", body.Status)
	}
}

func TestUnknownRoute(t *testing.T) {
	t.Parallel()

	api := handler.NewAPI(service.NewHealthService())
	resp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/missing",
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-404",
			HTTP: events.APIGatewayV2HTTPRequestContextHTTPDescription{
				Method: "GET",
			},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != 404 {
		t.Fatalf("status = %d, want 404", resp.StatusCode)
	}

	var body model.APIError
	if err := json.Unmarshal([]byte(resp.Body), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if body.Code != "NOT_FOUND" {
		t.Fatalf("code = %q, want NOT_FOUND", body.Code)
	}
	if body.RequestID != "req-404" {
		t.Fatalf("requestId = %q, want req-404", body.RequestID)
	}
}
