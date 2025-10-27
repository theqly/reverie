package repository

import (
	"content-service/internal/models"
	"context"
	"fmt"

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

func (r *PinRepository) GetByUser(ctx context.Context, userID uuid.UUID) ([]models.Pin, error) {
	var pins []models.Pin
	err := r.db.WithContext(ctx).Find(&pins, "owner_id = ?", userID).Error
	return pins, err
}

func (r *PinRepository) GetByName(ctx context.Context, name string) ([]models.Pin, error) {
	var pins []models.Pin
	err := r.db.WithContext(ctx).Find(&pins, "name = ?", name).Error
	return pins, err
}

func (r *PinRepository) Update(ctx context.Context, id uuid.UUID, updated models.Pin) error {
	return r.db.WithContext(ctx).Model(&models.Board{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":        updated.Name,
			"latitude":    updated.Latitude,
			"longitude":   updated.Longitude,
			"description": updated.Description,
			"rating":      updated.Rating,
		}).Error
}

func (r *PinRepository) AddComment(ctx context.Context, pinID uuid.UUID, userID uuid.UUID, content string) (*models.Comment, error) {
	comment := models.Comment{
		PinID:   pinID,
		UserID:  userID,
		Content: content,
	}

	if err := r.db.WithContext(ctx).Create(comment).Error; err != nil {
		return nil, err
	}

	return &comment, nil
}

func (r *PinRepository) DeleteCommentByID(ctx context.Context, commentID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("id = ?", commentID).
		Delete(&models.Comment{}).Error
}

func (r *PinRepository) UpdateComment(ctx context.Context, commentID uuid.UUID, newContent string) (*models.Comment, error) {
	res := r.db.WithContext(ctx).
		Model(&models.Comment{}).
		Where("id = ?", commentID).
		Update("content", newContent)

	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, fmt.Errorf("comment not found")
	}
	var updatedComment models.Comment
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
