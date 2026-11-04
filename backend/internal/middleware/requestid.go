package middleware

import "github.com/aws/aws-lambda-go/events"

func RequestID(req events.APIGatewayV2HTTPRequest) string {
	if req.RequestContext.RequestID != "" {
		return req.RequestContext.RequestID
	}
	if req.Headers != nil {
		if value := req.Headers["x-request-id"]; value != "" {
			return value
		}
	}
	return "unknown"
}
