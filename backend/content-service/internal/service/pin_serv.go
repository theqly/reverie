package service

import (
	"content-service/internal/models"
	"content-service/internal/repository"
	"context"
	"time"

	"github.com/google/uuid"
)

type PinService struct {
	pinRepo *repository.PinRepository
}

func NewPinService(pinRepo *repository.PinRepository) *PinService {
	return &PinService{pinRepo: pinRepo}
}

func (s *PinService) CreatePin(ctx context.Context, pin *models.Pin) (*models.Pin, error) {
	pin.ID = uuid.New()
	pin.CreatedAt = time.Now()
	if err := s.pinRepo.Create(ctx, *pin); err != nil {
		return nil, err
	}
	return pin, nil
}

func (s *PinService) GetPin(ctx context.Context, id uuid.UUID) (*models.Pin, error) {
	pin, err := s.pinRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &pin, nil
}
