package repository

import (
	"content-service/internal/models"
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookmarkRepository struct {
	db *gorm.DB
}

func NewBookmarkRepository(db *gorm.DB) *BookmarkRepository {
	return &BookmarkRepository{db: db}
}

func (r *BookmarkRepository) ToggleBookmarkToPin(ctx context.Context, pinID uuid.UUID, userID uuid.UUID) (bool, error) {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var bookmark models.BookmarkPin

		err := tx.Where("pin_id = ? AND user_id = ?", pinID, userID).First(&bookmark).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newBookmark := models.BookmarkPin{
					PinID:  pinID,
					UserID: userID,
				}
				return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newBookmark).Error
			}
			return err
		}

		return tx.Delete(&bookmark).Error
	})

	if err != nil {
		return false, err
	}

	return true, nil
}

func (r *BookmarkRepository) ToggleBookmarkToBoard(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (bool, error) {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var bookmark models.BookmarkBoard

		err := tx.Where("board_id = ? AND user_id = ?", boardID, userID).First(&bookmark).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newBookmark := models.BookmarkBoard{
					BoardID: boardID,
					UserID:  userID,
				}
				return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newBookmark).Error
			}
			return err
		}

		return tx.Delete(&bookmark).Error
	})

	if err != nil {
		return false, err
	}

	return true, nil
}
