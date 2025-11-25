package repository

import (
	"content-service/internal/models"
	"context"
	"errors"
	"gorm.io/gorm"

	"github.com/google/uuid"
)

type ReactionRepository struct {
	db *gorm.DB
}

func NewReactionRepository(db *gorm.DB) *ReactionRepository {
	return &ReactionRepository{db: db}
}

func (r *ReactionRepository) GetAll(ctx context.Context) ([]models.Reaction, error) {
	var reactions []models.Reaction

	err := r.db.WithContext(ctx).Model(&models.Reaction{}).Find(&reactions).Error
	return reactions, err
}

func (r *ReactionRepository) CountTotalReactionsInPin(ctx context.Context, pinID uuid.UUID) (int64, error) {
	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.ReactionPin{}).
		Where("pin_id = ?", pinID).
		Count(&count).Error

	return count, err
}

func (r *ReactionRepository) ToggleReaction(ctx context.Context, pinID, reactionID, userID uuid.UUID) (bool, error) {
	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return false, tx.Error
	}

	var existingLink models.ReactionPin
	err := tx.Where("pin_id = ? AND reaction_id = ? AND owner_id = ?", pinID, reactionID, userID).
		First(&existingLink).Error

	if err != nil { // no records, create new one -> true on success
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			return false, err
		}

		newLink := models.ReactionPin{
			PinID:      pinID,
			ReactionID: reactionID,
			OwnerID:    userID,
		}

		if err := tx.Create(&newLink).Error; err != nil {
			tx.Rollback()
			return false, err
		}
	} else {
		if err := tx.Delete(&existingLink).Error; err != nil {
			tx.Rollback()
			return false, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return false, err
	}
	return true, nil
}

