package service

import (
	"content-service/graph/model"
	"content-service/internal/mapper"
	"content-service/internal/repository"
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type PinService struct {
	pinRepo *repository.PinRepository
}

func NewPinService(pinRepo *repository.PinRepository) *PinService {
	return &PinService{pinRepo: pinRepo}
}

func (s *PinService) CreatePin(ctx context.Context, input model.CreatePinInput) (*model.Pin, error) {
	pin := mapper.CreateToDomainPin(&input)
	pin.ID = uuid.New()
	pin.CreatedAt = time.Now()

	if err := s.pinRepo.Create(ctx, *pin); err != nil {
		return nil, err
	}
	return mapper.ToGraphQLPin(pin), nil
}

func (s *PinService) Pin(ctx context.Context, id uuid.UUID) (*model.Pin, error) {
	pin, err := s.pinRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return mapper.ToGraphQLPin(&pin), nil
}

func (s *PinService) UpdatePin(ctx context.Context, id uuid.UUID, input model.UpdatePinInput) (*model.Pin, error) {
	pin := mapper.UpdateToDomainPin(&input)

	//тут нужно проверку вставить для прав пользователя
	prevPin, err := s.pinRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if prevPin.OwnerID != input.UserID {
		return nil, errors.New("incorrect user (not pin`s owner)")
	}

	err = s.pinRepo.Update(ctx, id, *pin)
	if err != nil {
		return nil, err
	}

	return s.Pin(ctx, id)
}
