package service

import "orbitforge/backend/internal/model"

type HealthService struct{}

func NewHealthService() *HealthService {
	return &HealthService{}
}

func (s *HealthService) Check() model.HealthResponse {
	return model.HealthResponse{Status: "ok"}
}
