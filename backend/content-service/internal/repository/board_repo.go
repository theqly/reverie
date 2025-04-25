package repository

import (
	"content-service/internal/models"
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BoardRepository struct {
	db *gorm.DB
}

func NewBoardRepository(db *gorm.DB) *BoardRepository {
	return &BoardRepository{db: db}
}

func (r *BoardRepository) Create(ctx context.Context, board models.Board) error {
	return r.db.WithContext(ctx).Create(&board).Error
}

func (r *BoardRepository) GetByID(ctx context.Context, id uuid.UUID) (models.Board, error) {
	var board models.Board
	err := r.db.WithContext(ctx).First(&board, "id = ?", id).Error
	return board, err
}

func (r *BoardRepository) GetByName(ctx context.Context, name string) ([]models.Board, error) {
	var boards []models.Board
	err := r.db.WithContext(ctx).Find(&boards, "name = ?", name).Error
	return boards, err
}

func (r *BoardRepository) GetByGroup(ctx context.Context, groupID uuid.UUID) ([]models.Board, error) {
	var boards []models.Board
	err := r.db.WithContext(ctx).Find(&boards, "group_id = ?", groupID).Error
	return boards, err
}

func (r *BoardRepository) Update(ctx context.Context, id uuid.UUID, updated models.Board) error {
	return r.db.WithContext(ctx).Model(&models.Board{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":        updated.Name,
			"accessLevel": updated.AccessLevelID,
		}).Error
}
