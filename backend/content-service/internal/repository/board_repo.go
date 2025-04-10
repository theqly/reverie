package repository

import (
	"content-service/internal/model"

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

func (r *BoardRepository) Create(ctx context.Context, board model.Board) error {
	return r.db.WithContext(ctx).Create(&board).Error
}

func (r *BoardRepository) GetByID(ctx context.Context, id uuid.UUID) (model.Board, error) {
	var board model.Board
	err := r.db.WithContext(ctx).First(&board, "id = ?", id).Error
	return board, err
}
