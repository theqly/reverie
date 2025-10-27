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

func (r *BoardRepository) GetByID(ctx context.Context, id uuid.UUID, preloads ...string) (models.Board, error) {
	var board models.Board

	tx := r.db.WithContext(ctx)
	for _, preload := range preloads {
		tx = tx.Preload(preload)
	}

	err := tx.First(&board, "id = ?", id).Error
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

func (r *BoardRepository) AddPinToBoard(ctx context.Context, pinID uuid.UUID, boardID uuid.UUID) (*models.Board, error) {
	err := r.db.WithContext(ctx).Create(&models.BoardPin{
		BoardID: boardID,
		PinID:   pinID,
	}).Error

	if err != nil {
		return nil, err
	}

	board, err := r.GetByID(ctx, boardID)

	return &board, err
}

func (r *BoardRepository) RemovePinFromBoard(ctx context.Context, pinID uuid.UUID, boardID uuid.UUID) (*models.Board, error) {
	err := r.db.WithContext(ctx).
		Where("board_id = ? AND pin_id = ?", boardID, pinID).
		Delete(&models.BoardPin{}).Error

	if err != nil {
		return nil, err
	}

	board, err := r.GetByID(ctx, boardID)

	return &board, err
}
