package repository

import (
	"content-service/internal/models"
	"context"
	"errors"

	"github.com/google/uuid"
	kafka "github.com/theqly/reverie/backend/kafka-module"
	events1 "github.com/theqly/reverie/backend/kafka-module/events/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookmarkRepository struct {
	db        *gorm.DB
	publisher *kafka.Producer
}

func NewBookmarkRepository(db *gorm.DB, publisher *kafka.Producer) *BookmarkRepository {
	return &BookmarkRepository{db: db, publisher: publisher}
}

func (r *BookmarkRepository) ToggleBookmarkToPin(ctx context.Context, pinID uuid.UUID, userID uuid.UUID) (bool, error) {
	logger := zap.L().With(zap.String("repository", "ToggleBookmarkToPin"))

	var operation string

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var bookmark models.BookmarkPin

		err := tx.Where("pin_id = ? AND user_id = ?", pinID, userID).First(&bookmark).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newBookmark := models.BookmarkPin{
					PinID:  pinID,
					UserID: userID,
				}
				if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newBookmark).Error; err != nil {
					return err
				}
				operation = "added"
				return nil
			}
			return err
		}

		if err := tx.Delete(&bookmark).Error; err != nil {
			return err
		}
		operation = "deleted"
		return nil
	})

	if err != nil {
		return false, err
	}

	if r.publisher != nil {
		go func(operation string, pinID, userID uuid.UUID) {
			switch operation {
			case "added":
				event := events1.PinBookmarkAdded{
					BaseEvent: kafka.NewBaseEvent(),
					PinID:     pinID.String(),
					OwnerID:   userID.String(),
				}
				if err := r.publisher.PublishPinBookmarkAdded(context.Background(), event); err != nil {
					logger.Error("failed to publish pin.bookmark.created event", zap.Error(err))
				}

			case "deleted":
				event := events1.PinBookmarkDeleted{
					BaseEvent: kafka.NewBaseEvent(),
					PinID:     pinID.String(),
					OwnerID:   userID.String(),
				}
				if err := r.publisher.PublishPinBookmarkDeleted(context.Background(), event); err != nil {
					logger.Error("failed to publish pin.bookmark.deleted event", zap.Error(err))
				}
			}
		}(operation, pinID, userID)
	}

	return true, nil
}

func (r *BookmarkRepository) ToggleBookmarkToBoard(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (bool, error) {
	logger := zap.L().With(zap.String("repository", "ToggleBookmarkToBoard"))

	var operation string

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var bookmark models.BookmarkBoard

		err := tx.Where("board_id = ? AND user_id = ?", boardID, userID).First(&bookmark).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newBookmark := models.BookmarkBoard{
					BoardID: boardID,
					UserID:  userID,
				}
				if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newBookmark).Error; err != nil {
					return err
				}
				operation = "added"
				return nil
			}
			return err
		}

		if err := tx.Delete(&bookmark).Error; err != nil {
			return err
		}
		operation = "deleted"
		return nil
	})

	if err != nil {
		return false, err
	}

	if r.publisher != nil {
		go func(operation string, boardID, userID uuid.UUID) {
			switch operation {
			case "added":
				event := events1.BoardBookmarkAdded{
					BaseEvent: kafka.NewBaseEvent(),
					BoardID:   boardID.String(),
					OwnerID:   userID.String(),
				}
				if err := r.publisher.PublishBoardBookmarkAdded(context.Background(), event); err != nil {
					logger.Error("failed to publish board.bookmark.created event", zap.Error(err))
				}

			case "deleted":
				event := events1.BoardBookmarkDeleted{
					BaseEvent: kafka.NewBaseEvent(),
					BoardID:   boardID.String(),
					OwnerID:   userID.String(),
				}
				if err := r.publisher.PublishBoardBookmarkDeleted(context.Background(), event); err != nil {
					logger.Error("failed to publish board.bookmark.deleted event", zap.Error(err))
				}
			}
		}(operation, boardID, userID)
	}

	return true, nil
}
