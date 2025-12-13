package repository

import (
	"content-service/internal/models"
	"content-service/internal/utils"
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	kafka "github.com/theqly/reverie/backend/kafka-module"
	events1 "github.com/theqly/reverie/backend/kafka-module/events/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type PinRepository struct {
	db        *gorm.DB
	publisher *kafka.Producer
}

func NewPinRepository(db *gorm.DB, publisher *kafka.Producer) *PinRepository {
	return &PinRepository{db: db, publisher: publisher}
}

func (r *PinRepository) Create(ctx context.Context, pin models.Pin) error {
	logger := zap.L().With(zap.String("repository", "CreatePin"))

	// Set author_id to owner_id for new pins (original content)
	if pin.AuthorID == uuid.Nil {
		pin.AuthorID = pin.OwnerID
	}

	// Set saved_at to current time if not set
	if pin.SavedAt.IsZero() {
		pin.SavedAt = pin.CreatedAt
	}

	err := r.db.WithContext(ctx).Create(&pin).Error

	if err == nil && r.publisher != nil {
		go func(p models.Pin) {
			event := events1.PinCreated{
				BaseEvent:   kafka.NewBaseEvent(),
				PinID:       p.ID.String(),
				Name:        p.Name,
				OwnerID:     p.OwnerID.String(),
				AuthorID:    p.AuthorID.String(),
				Description: p.Description,
				Latitude:    p.Latitude,
				Longitude:   p.Longitude,
				Address:     p.Address,
				Rating:      p.Rating,
				CreatedAt:   p.CreatedAt,
				SavedAt:     p.SavedAt,
				PlaceID:     "0",
			}
			if err := r.publisher.PublishPinCreated(context.Background(), event); err != nil {
				logger.Info("failed to publish pin.created event", zap.Error(err))
			}
		}(pin)
	}

	return err
}

func (r *PinRepository) CopyPin(ctx context.Context, pinID uuid.UUID, newOwnerID uuid.UUID) (*models.Pin, error) {
	logger := zap.L().With(zap.String("repository", "CopyPin"))

	// Get the original pin
	originalPin, err := r.GetByID(ctx, pinID, nil)
	if err != nil {
		logger.Error("Failed to get original pin", zap.Error(err))
		return nil, err
	}

	// Create a copy with new owner and current saved_at time
	var copiedPin models.Pin
	// Start transaction for atomicity
	err = r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		copiedPin = models.Pin{
			Name:        originalPin.Name,
			OwnerID:     newOwnerID,
			AuthorID:    originalPin.AuthorID, // Keep original author
			Address:     originalPin.Address,
			Latitude:    originalPin.Latitude,
			Longitude:   originalPin.Longitude,
			Description: originalPin.Description,
			Rating:      originalPin.Rating,
			CreatedAt:   originalPin.CreatedAt, // Keep original creation time
			SavedAt:     time.Now(),            // Set current time as saved time
			PlaceID:     originalPin.PlaceID,
		}

		if err := tx.Create(&copiedPin).Error; err != nil {
			logger.Error("Failed to create copied pin", zap.Error(err))
			return err
		}

		// Copy images if they exist
		if len(originalPin.Images) > 0 {
			for _, img := range originalPin.Images {
				newImage := models.PinImage{
					PinID:       copiedPin.ID,
					ImageURL:    img.ImageURL,
					OrderNumber: img.OrderNumber,
				}
				if err := tx.Create(&newImage).Error; err != nil {
					logger.Error("Failed to copy pin image", zap.Error(err))
					// Rollback the transaction if any image fails to copy
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	if r.publisher != nil {
		go func(p models.Pin) {
			event := events1.PinCreated{
				BaseEvent:   kafka.NewBaseEvent(),
				PinID:       p.ID.String(),
				Name:        p.Name,
				OwnerID:     p.OwnerID.String(),
				Description: p.Description,
				Latitude:    p.Latitude,
				Longitude:   p.Longitude,
				Address:     p.Address,
				Rating:      p.Rating,
				CreatedAt:   p.CreatedAt,
				PlaceID:     "0",
			}
			if err := r.publisher.PublishPinCreated(context.Background(), event); err != nil {
				logger.Info("failed to publish pin.created event: %v", zap.String("err", err.Error()))
			}
		}(copiedPin)
	}

	return &copiedPin, nil
}

func (r *PinRepository) withViewerData(tx *gorm.DB, viewerID *uuid.UUID) *gorm.DB {
	if viewerID == nil {
		return tx
	}

	tx = tx.Select("pins.*, rp.reaction_id, (bp.pin_id IS NOT NULL) as bookmarked")
	tx = tx.Joins("LEFT JOIN reaction_pins rp ON rp.pin_id = pins.id AND rp.owner_id = ?", viewerID)
	tx = tx.Joins("LEFT JOIN bookmarks_pins bp ON bp.pin_id = pins.id AND bp.user_id = ?", viewerID)

	return tx
}

func (r *PinRepository) GetByID(ctx context.Context, id uuid.UUID, viewerID *uuid.UUID) (models.Pin, error) {
	var pin models.Pin

	tx := r.db.WithContext(ctx)

	tx = r.withViewerData(tx, viewerID)

	requestedFields := utils.DoesItNeedFields(ctx, "images")
	if requestedFields != nil && requestedFields["images"] {
		tx = tx.Preload("Images")
	}

	err := tx.First(&pin, "pins.id = ?", id).Error
	return pin, err
}

func (r *PinRepository) GetByUser(ctx context.Context, userID uuid.UUID, viewerID *uuid.UUID, limit, offset int) ([]models.Pin, error) {
	var pins []models.Pin

	tx := r.db.WithContext(ctx)

	tx = r.withViewerData(tx, viewerID)

	requestedFields := utils.DoesItNeedFields(ctx, "images")
	if requestedFields != nil && requestedFields["images"] {
		tx = tx.Preload("Images")
	}

	err := tx.Order("saved_at DESC").Limit(limit).Offset(offset).Find(&pins, "owner_id = ?", userID).Error
	return pins, err
}

func (r *PinRepository) GetByName(ctx context.Context, name string, viewerID *uuid.UUID, limit, offset int) ([]models.Pin, error) {
	var pins []models.Pin

	tx := r.db.WithContext(ctx)

	tx = r.withViewerData(tx, viewerID)

	requestedFields := utils.DoesItNeedFields(ctx, "images")
	if requestedFields != nil && requestedFields["images"] {
		tx = tx.Preload("Images")
	}

	err := tx.Order("id DESC").Limit(limit).Offset(offset).Find(&pins, "name = ?", name).Error
	return pins, err
}

func (r *PinRepository) Update(ctx context.Context, id uuid.UUID, updated models.Pin) error {
	logger := zap.L().With(zap.String("repository", "UpdatePin"))

	err := r.db.WithContext(ctx).Model(&models.Pin{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":        updated.Name,
			"latitude":    updated.Latitude,
			"longitude":   updated.Longitude,
			"description": updated.Description,
			"rating":      updated.Rating,
		}).Error

	if err == nil && r.publisher != nil {
		go func(p models.Pin) {
			event := events1.PinUpdated{
				BaseEvent:   kafka.NewBaseEvent(),
				PinID:       p.ID.String(),
				Name:        p.Name,
				Description: p.Description,
				Latitude:    p.Latitude,
				Longitude:   p.Longitude,
				Address:     p.Address,
				Rating:      p.Rating,
				PlaceID:     "0",
			}
			if err := r.publisher.PublishPinUpdated(context.Background(), event); err != nil {
				logger.Info("failed to publish pin.updated event: %v", zap.String("err", err.Error()))
			}
		}(updated)
	}

	return err
}

func (r *PinRepository) GetCommentsByPin(ctx context.Context, pinID uuid.UUID, limit, offset int) ([]models.PinComment, error) {
	var comments []models.PinComment

	err := r.db.WithContext(ctx).
		Order("id DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments, "pin_id = ?", pinID).
		Error

	return comments, err
}

func (r *PinRepository) AddCommentToPin(ctx context.Context, pinID uuid.UUID, userID uuid.UUID, message string) (*models.PinComment, error) {
	logger := zap.L().With(zap.String("repository", "AddCommentToPin"))

	comment := &models.PinComment{
		PinID:   pinID,
		OwnerID: userID,
		Message: message,
	}

	err := r.db.WithContext(ctx).Create(comment).Error

	if err != nil {
		return nil, err
	}

	if r.publisher != nil {
		go func(p models.PinComment) {
			event := events1.PinCommented{
				BaseEvent: kafka.NewBaseEvent(),
				PinID:     p.ID.String(),
				CommentID: p.ID.String(),
				OwnerID:   p.OwnerID.String(),
				Message:   p.Message,
			}
			if err := r.publisher.PublishPinCommented(context.Background(), event); err != nil {
				logger.Info("failed to publish pin.comment.created event: %v", zap.String("err", err.Error()))
			}
		}(*comment)
	}

	return comment, nil
}

func (r *PinRepository) DeleteCommentToPinByID(ctx context.Context, commentID uuid.UUID) error {
	logger := zap.L().With(zap.String("repository", "DeleteCommentToPinByID"))

	err := r.db.WithContext(ctx).
		Where("id = ?", commentID).
		Delete(&models.PinComment{}).Error

	if err == nil && r.publisher != nil {
		go func(commentID uuid.UUID) {
			event := events1.PinCommentDeleted{
				BaseEvent: kafka.NewBaseEvent(),
				CommentID: commentID.String(),
			}
			if err := r.publisher.PublishPinCommentDeleted(context.Background(), event); err != nil {
				logger.Info("failed to publish pin.comment.deleted event: %v", zap.String("err", err.Error()))
			}
		}(commentID)
	}

	return err
}

func (r *PinRepository) UpdateCommentToPin(ctx context.Context, commentID uuid.UUID, newMessage string) (*models.PinComment, error) {
	logger := zap.L().With(zap.String("repository", "UpdateCommentToPin"))

	res := r.db.WithContext(ctx).
		Model(&models.PinComment{}).
		Where("id = ?", commentID).
		Update("message", newMessage)

	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, fmt.Errorf("comment not found")
	}

	if r.publisher != nil {
		go func(commentID uuid.UUID, newMessage string) {
			event := events1.PinCommented{
				BaseEvent: kafka.NewBaseEvent(),
				CommentID: commentID.String(),
				Message:   newMessage,
			}
			if err := r.publisher.PublishPinCommented(context.Background(), event); err != nil {
				logger.Info("failed to publish pin.comment.updated event: %v", zap.String("err", err.Error()))
			}
		}(commentID, newMessage)
	}

	var updatedComment models.PinComment
	err := r.db.WithContext(ctx).
		First(&updatedComment, "id = ?", commentID).Error
	if err != nil {
		return nil, err
	}

	return &updatedComment, nil
}

func (r *PinRepository) AddPinImage(ctx context.Context, pinID uuid.UUID, imageUrl string, orderNumber int) (*models.PinImage, error) {
	var newImage *models.PinImage

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var count int64
		if err := tx.Model(&models.PinImage{}).
			Where("pin_id = ?", pinID).
			Count(&count).Error; err != nil {
			return err
		}

		if orderNumber < 1 || orderNumber > int(count)+1 {
			return fmt.Errorf("order number %d is out of valid range (1 to %d)", orderNumber, count+1)
		}

		if err := tx.Model(&models.PinImage{}).
			Where("pin_id = ? AND order_number >= ?", pinID, orderNumber).
			Update("order_number", gorm.Expr("order_number + 1")).Error; err != nil {
			return err
		}

		newImage = &models.PinImage{
			PinID:       pinID,
			ImageURL:    imageUrl,
			OrderNumber: orderNumber,
		}
		if err := tx.Create(newImage).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return newImage, nil
}

func (r *PinRepository) DeletePinImage(ctx context.Context, pinImageID uuid.UUID) error {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var pinImage models.PinImage
		if err := tx.First(&pinImage, "id = ?", pinImageID).Error; err != nil {
			return err
		}

		if err := tx.Delete(&pinImage).Error; err != nil {
			return err
		}

		if err := tx.Model(&models.PinImage{}).
			Where("pin_id = ? AND order_number > ?", pinImage.PinID, pinImage.OrderNumber).
			Update("order_number", gorm.Expr("order_number - 1")).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (r *PinRepository) UpdatePinImageOrder(ctx context.Context, pinImageID uuid.UUID, newOrderNumber int) (*models.PinImage, error) {
	var updatedImage *models.PinImage

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var pinImage models.PinImage
		if err := tx.First(&pinImage, "id = ?", pinImageID).Error; err != nil {
			return err
		}

		var count int64
		if err := tx.Model(&models.PinImage{}).
			Where("pin_id = ?", pinImage.PinID).
			Count(&count).Error; err != nil {
			return err
		}

		if newOrderNumber < 1 || newOrderNumber > int(count) {
			return fmt.Errorf("order number %d is out of valid range (1 to %d)", newOrderNumber, count)
		}

		if newOrderNumber > pinImage.OrderNumber {
			if err := tx.Model(&models.PinImage{}).
				Where("pin_id = ? AND order_number > ? AND order_number <= ?", pinImage.PinID, pinImage.OrderNumber, newOrderNumber).
				Update("order_number", gorm.Expr("order_number - 1")).Error; err != nil {
				return err
			}
		}

		if newOrderNumber < pinImage.OrderNumber {
			if err := tx.Model(&models.PinImage{}).
				Where("pin_id = ? AND order_number >= ? AND order_number < ?", pinImage.PinID, newOrderNumber, pinImage.OrderNumber).
				Update("order_number", gorm.Expr("order_number + 1")).Error; err != nil {
				return err
			}
		}

		pinImage.OrderNumber = newOrderNumber
		if err := tx.Save(&pinImage).Error; err != nil {
			return err
		}

		updatedImage = &pinImage
		return nil
	})

	if err != nil {
		return nil, err
	}

	return updatedImage, nil
}

func (r *PinRepository) CountPinsByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var pinsNumber int64

	err := r.db.WithContext(ctx).
		Model(&models.Pin{}).
		Where("owner_id = ?", userID).
		Count(&pinsNumber).Error

	if err != nil {
		return 0, err
	}

	return pinsNumber, nil
}
