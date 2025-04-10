package service

import (
	"content-service/internal/model"
	"content-service/internal/repository"
	"context"

	"github.com/google/uuid"
)

type PinService struct {
	pinRepo repository.PinRepository
}

func NewPinService(pinRepo repository.PinRepository) *PinService {
	return &PinService{pinRepo: pinRepo}
}

func (s *PinService) CreatePin(ctx context.Context, pin model.Pin) error {
	return s.pinRepo.Create(ctx, pin)
}

func (s *PinService) GetPin(ctx context.Context, id uuid.UUID) (model.Pin, error) {
	return s.pinRepo.GetByID(ctx, id)
}
