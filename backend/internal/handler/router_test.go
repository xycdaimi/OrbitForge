package handler_test

import (
	"encoding/json"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"orbitforge/backend/internal/handler"
	"orbitforge/backend/internal/model"
	"orbitforge/backend/internal/repository"
	"orbitforge/backend/internal/service"
)

func newTestAPI() *handler.API {
	store := repository.NewMemoryStore()
	return handler.NewAPI(
		service.NewHealthService(),
		service.NewFeedbackService(store, func() string { return "fb-1" }),
		service.NewReactionService(store),
		nil,
	)
}

func TestHealthOK(t *testing.T) {
	t.Parallel()

	api := newTestAPI()
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

	api := newTestAPI()
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

func TestCreateFeedbackAndReactions(t *testing.T) {
	t.Parallel()

	api := newTestAPI()

	feedbackResp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/feedback",
		Body:    `{"articleSlug":"distributed-task-execution","message":"很有帮助"}`,
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-feedback",
			HTTP:      events.APIGatewayV2HTTPRequestContextHTTPDescription{Method: "POST"},
		},
	})
	if err != nil {
		t.Fatalf("feedback error: %v", err)
	}
	if feedbackResp.StatusCode != 201 {
		t.Fatalf("feedback status = %d, want 201; body=%s", feedbackResp.StatusCode, feedbackResp.Body)
	}

	reactionResp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/articles/distributed-task-execution/reactions",
		Body:    `{"type":"useful"}`,
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-reaction",
			HTTP:      events.APIGatewayV2HTTPRequestContextHTTPDescription{Method: "POST"},
		},
	})
	if err != nil {
		t.Fatalf("reaction error: %v", err)
	}
	if reactionResp.StatusCode != 200 {
		t.Fatalf("reaction status = %d, want 200; body=%s", reactionResp.StatusCode, reactionResp.Body)
	}

	summaryResp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/articles/distributed-task-execution/reactions",
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-summary",
			HTTP:      events.APIGatewayV2HTTPRequestContextHTTPDescription{Method: "GET"},
		},
	})
	if err != nil {
		t.Fatalf("summary error: %v", err)
	}

	var summary model.ReactionSummary
	if err := json.Unmarshal([]byte(summaryResp.Body), &summary); err != nil {
		t.Fatalf("decode summary: %v", err)
	}
	if summary.Useful != 1 {
		t.Fatalf("useful = %d, want 1", summary.Useful)
	}
}

func TestInvalidFeedback(t *testing.T) {
	t.Parallel()

	api := newTestAPI()
	resp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/feedback",
		Body:    `{"articleSlug":"BAD","message":""}`,
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-invalid",
			HTTP:      events.APIGatewayV2HTTPRequestContextHTTPDescription{Method: "POST"},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != 400 {
		t.Fatalf("status = %d, want 400", resp.StatusCode)
	}
}

func TestStudioRequiresAuth(t *testing.T) {
	api := newTestAPI()
	resp, err := api.Handle(events.APIGatewayV2HTTPRequest{
		RawPath: "/api/v1/studio/documents",
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			RequestID: "req-studio",
			HTTP:      events.APIGatewayV2HTTPRequestContextHTTPDescription{Method: "GET"},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 401 {
		t.Fatalf("status = %d, want 401", resp.StatusCode)
	}
}
