package repository

import (
	"content-service/internal/model"

	"context"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type PinRepository struct {
	db *gorm.DB
}

func NewPinRepository(db *gorm.DB) *PinRepository {
	return &PinRepository{db: db}
}

func (r *PinRepository) Create(ctx context.Context, pin model.Pin) error {
	return r.db.WithContext(ctx).Create(&pin).Error
}

func (r *PinRepository) GetByID(ctx context.Context, id uuid.UUID) (model.Pin, error) {
	var pin model.Pin
	err := r.db.WithContext(ctx).First(&pin, "id = ?", id).Error
	return pin, err
}
