package repository

import (
	"content-service/internal/models"
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

func (r *PinRepository) Create(ctx context.Context, pin models.Pin) error {
	return r.db.WithContext(ctx).Create(&pin).Error
}

func (r *PinRepository) GetByID(ctx context.Context, id uuid.UUID) (models.Pin, error) {
	var pin models.Pin
	err := r.db.WithContext(ctx).First(&pin, "id = ?", id).Error
	return pin, err
}

func (r *PinRepository) Update(ctx context.Context, id uuid.UUID, updated models.Pin) error {
	return r.db.WithContext(ctx).Model(&models.Board{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":        updated.Name,
			"latitude":    updated.Lat,
			"longitude":   updated.Lng,
			"description": updated.Description,
			"rating":      updated.Rating,
		}).Error
}
