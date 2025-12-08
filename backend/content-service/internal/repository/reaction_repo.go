package repository

import (
	"content-service/internal/models"
	"context"
	"errors"

	kafka "github.com/theqly/reverie/backend/kafka-module"
	events1 "github.com/theqly/reverie/backend/kafka-module/events/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/google/uuid"
)

type ReactionRepository struct {
	db        *gorm.DB
	publisher *kafka.Producer
}

func NewReactionRepository(db *gorm.DB, publisher *kafka.Producer) *ReactionRepository {
	return &ReactionRepository{db: db, publisher: publisher}
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
	logger := zap.L().With(zap.String("repository", "ToggleReactionToPin"))

	var operation string

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existingLink models.ReactionPin

		err := tx.Where("pin_id = ? AND reaction_id = ? AND owner_id = ?", pinID, reactionID, userID).
			First(&existingLink).Error

		if err != nil { // no records, create new one -> true on success
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newLink := models.ReactionPin{
					PinID:      pinID,
					ReactionID: reactionID,
					OwnerID:    userID,
				}
				if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newLink).Error; err != nil {
					return err
				}
				operation = "added"
				return nil
			}
			return err
		}

		if err := tx.Delete(&existingLink).Error; err != nil {
			return err
		}
		operation = "deleted"
		return nil
	})

	if err != nil {
		return false, err
	}

	if r.publisher != nil {
		go func(operation string, pinID, reactionID, userID uuid.UUID) {
			switch operation {
			case "added":
				event := events1.PinReactionAdded{
					BaseEvent:  kafka.NewBaseEvent(),
					PinID:      pinID.String(),
					ReactionID: reactionID.String(),
					OwnerID:    userID.String(),
				}
				if err := r.publisher.PublishPinReactionAdded(context.Background(), event); err != nil {
					logger.Error("failed to publish pin.reaction.created event", zap.Error(err))
				}

			case "deleted":
				event := events1.PinReactionDeleted{
					BaseEvent:  kafka.NewBaseEvent(),
					PinID:      pinID.String(),
					ReactionID: reactionID.String(),
					OwnerID:    userID.String(),
				}
				if err := r.publisher.PublishPinReactionDeleted(context.Background(), event); err != nil {
					logger.Error("failed to publish pin.reaction.deleted event", zap.Error(err))
				}
			}
		}(operation, pinID, reactionID, userID)
	}

	return true, nil
}

func (r *ReactionRepository) ToggleReactionToBoard(ctx context.Context, boardID, reactionID, userID uuid.UUID) (bool, error) {
	logger := zap.L().With(zap.String("repository", "ToggleReactionToBoard"))

	var operation string

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existingLink models.ReactionBoard

		err := tx.Where("board_id = ? AND reaction_id = ? AND owner_id = ?", boardID, reactionID, userID).
			First(&existingLink).Error

		if err != nil { // no records, create new one -> true on success
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newLink := models.ReactionBoard{
					BoardID:    boardID,
					ReactionID: reactionID,
					OwnerID:    userID,
				}
				if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&newLink).Error; err != nil {
					return err
				}
				operation = "added"
				return nil
			}
			return err
		}

		if err := tx.Delete(&existingLink).Error; err != nil {
			return err
		}
		operation = "deleted"
		return nil
	})

	if err != nil {
		return false, err
	}

	if r.publisher != nil {
		go func(operation string, boardID, reactionID, userID uuid.UUID) {
			switch operation {
			case "added":
				event := events1.BoardReactionAdded{
					BaseEvent:  kafka.NewBaseEvent(),
					BoardID:    boardID.String(),
					ReactionID: reactionID.String(),
					OwnerID:    userID.String(),
				}
				if err := r.publisher.PublishBoardReactionAdded(context.Background(), event); err != nil {
					logger.Error("failed to publish board.reaction.created event", zap.Error(err))
				}

			case "deleted":
				event := events1.BoardReactionDeleted{
					BaseEvent:  kafka.NewBaseEvent(),
					BoardID:    boardID.String(),
					ReactionID: reactionID.String(),
					OwnerID:    userID.String(),
				}
				if err := r.publisher.PublishBoardReactionDeleted(context.Background(), event); err != nil {
					logger.Error("failed to publish board.reaction.deleted event", zap.Error(err))
				}
			}
		}(operation, boardID, reactionID, userID)
	}

	return true, nil
}
