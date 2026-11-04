package handler

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"orbitforge/backend/internal/model"
)

func JSONResponse(status int, body any) (events.APIGatewayV2HTTPResponse, error) {
	payload, err := json.Marshal(body)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{}, err
	}

	return events.APIGatewayV2HTTPResponse{
		StatusCode: status,
		Headers: map[string]string{
			"content-type": "application/json",
		},
		Body: string(payload),
	}, nil
}

func ErrorResponse(status int, code, message, requestID string) (events.APIGatewayV2HTTPResponse, error) {
	return JSONResponse(status, model.APIError{
		Code:      code,
		Message:   message,
		RequestID: requestID,
	})
}
