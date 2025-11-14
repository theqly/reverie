package repository

import (
	"content-service/internal/models"
	"content-service/internal/utils"
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

	tx := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id")

	requestedFields := utils.DoesItNeedFields(ctx, "pins")
	if requestedFields != nil && requestedFields["pins"] {
		tx = tx.Preload("Pins")
	}

	err := tx.First(&board, "boards.id = ?", id).Error
	return board, err
}

func (r *BoardRepository) GetByName(ctx context.Context, name string) ([]models.Board, error) {
	var boards []models.Board

	tx := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id")

	err := tx.Where("boards.name = ?", name).Find(&boards).Error
	return boards, err
}

func (r *BoardRepository) GetByGroup(ctx context.Context, groupID uuid.UUID) ([]models.Board, error) {
	var boards []models.Board

	tx := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id")

	subQuery := r.db.Model(&models.OwnerType{}).Select("id").Where("type = ?", "group") // ??? пока что подзапросом

	err := tx.Where("boards.owner_type_id = (?) AND boards.owner_id = ?", subQuery, groupID).Find(&boards).Error
	return boards, err
}

func (r *BoardRepository) Update(ctx context.Context, id uuid.UUID, updated models.Board) error {
	return r.db.WithContext(ctx).Model(&models.Board{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":            updated.Name,
			"access_level_id": updated.AccessLevelID,
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

func (r *BoardRepository) CreateGroup(ctx context.Context, group models.Group) error {
	return r.db.WithContext(ctx).Create(&group).Error
}

func (r *BoardRepository) CreateMember(ctx context.Context, member models.Member) error {
	return r.db.WithContext(ctx).Create(&member).Error
}

func (r *BoardRepository) GetMember(ctx context.Context, userID uuid.UUID, groupID uuid.UUID) (models.Member, error) {
	var member models.Member
	err := r.db.WithContext(ctx).First(&member, "user_id = ? AND group_id = ?", userID, groupID).Error
	return member, err
}

func (r *BoardRepository) RemoveUserFromGroup(ctx context.Context, member models.Member) error {
	return r.db.WithContext(ctx).Delete(&member).Error
}

func (r *BoardRepository) GetGroupByID(ctx context.Context, id uuid.UUID) (models.Group, error) {
	var group models.Group
	err := r.db.WithContext(ctx).First(&group, "id = ?", id).Error
	return group, err
}

func (r *BoardRepository) GetMembers(ctx context.Context, groupID uuid.UUID) ([]models.Member, error) {
	var members []models.Member
	err := r.db.WithContext(ctx).Where("group_id = ?", groupID).Find(&members).Error
	return members, err
}

func (r *BoardRepository) GetGroups(ctx context.Context, userID uuid.UUID) ([]models.Member, error) {
	var members []models.Member
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&members).Error
	return members, err
}
