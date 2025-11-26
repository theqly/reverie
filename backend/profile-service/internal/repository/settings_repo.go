package repository

import (
	"context"
	"profile-service/internal/models"

	"gorm.io/gorm"
)

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) GetSettingsStatuses(ctx context.Context) ([]models.SettingsStatuses, error) {
	var statuses []models.SettingsStatuses
	err := r.db.WithContext(ctx).Find(&statuses).Error
	return statuses, err
}
