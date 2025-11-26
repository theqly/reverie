package repository

import (
	"content-service/internal/models"
	"context"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

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

func (r *ReactionRepository) CountTotalReactionsInBoard(ctx context.Context, boardID uuid.UUID) (int64, error) {
	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.ReactionBoard{}).
		Where("board_id = ?", boardID).
		Count(&count).Error

	return count, err
}

func (r *ReactionRepository) ToggleReactionToPin(ctx context.Context, pinID, reactionID, userID uuid.UUID) (bool, error) {
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

		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newLink).Error; err != nil {
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

func (r *ReactionRepository) ToggleReactionToBoard(ctx context.Context, boardID, reactionID, userID uuid.UUID) (bool, error) {
	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return false, tx.Error
	}

	var existingLink models.ReactionBoard
	err := tx.Where("board_id = ? AND reaction_id = ? AND owner_id = ?", boardID, reactionID, userID).
		First(&existingLink).Error

	if err != nil { // no records, create new one -> true on success
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			return false, err
		}

		newLink := models.ReactionBoard{
			BoardID:    boardID,
			ReactionID: reactionID,
			OwnerID:    userID,
		}

		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newLink).Error; err != nil {
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
