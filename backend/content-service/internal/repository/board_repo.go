package repository

import (
	"content-service/internal/models"
	"content-service/internal/utils"
	"context"
	"fmt"

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

func (r *BoardRepository) GetByName(ctx context.Context, name string, limit int, offset int) ([]models.Board, error) {
	var boards []models.Board

	tx := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id").
		Limit(limit).
		Offset(offset)

	err := tx.Where("boards.name = ?", name).Find(&boards).Error
	return boards, err
}

func (r *BoardRepository) GetByGroup(ctx context.Context, groupID uuid.UUID, limit int, offset int) ([]models.Board, error) {
	var boards []models.Board

	tx := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id").
		Limit(limit).
		Offset(offset)

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

func (r *BoardRepository) CreateGroup(ctx context.Context, members []uuid.UUID) (*models.Group, error) {
	// return r.db.WithContext(ctx).Create(&group).Error
	fullGroup := &models.Group{} // тут может быть ошибка

	err := r.db.Transaction(func(tx *gorm.DB) error {
		group := models.Group{}
		if err := tx.Create(&group).Error; err != nil {
			return err
		}

		if len(members) > 0 {
			membersModel := make([]models.Member, len(members))
			for i, userID := range members {
				membersModel[i] = models.Member{
					UserID:  userID,
					GroupID: group.ID,
				}
			}

			if err := tx.Create(&membersModel).Error; err != nil {
				return err
			}
		}

		if err := tx.Preload("Members").First(fullGroup, "id = ?", group.ID).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return fullGroup, nil
}

func (r *BoardRepository) CreateMember(ctx context.Context, member models.Member) error {
	return r.db.WithContext(ctx).Create(&member).Error
}

func (r *BoardRepository) GetMember(ctx context.Context, userID uuid.UUID, groupID uuid.UUID) (bool, error) {
	var member models.Member
	result := r.db.WithContext(ctx).Find(&member, "user_id = ? AND group_id = ?", userID, groupID)

	if result.Error != nil {
		return false, result.Error
	}

	if result.RowsAffected == 0 {
		return false, nil
	}

	return true, nil
}

func (r *BoardRepository) RemoveUserFromGroup(ctx context.Context, member models.Member) error {
	return r.db.WithContext(ctx).Delete(&member).Error
}

func (r *BoardRepository) GetGroupByID(ctx context.Context, id uuid.UUID) (models.Group, error) {
	var group models.Group

	tx := r.db.WithContext(ctx).
		Model(&models.Group{}).
		Select("groups.*").
		Joins("LEFT JOIN members as m ON m.group_id = groups.id")

	tx = tx.Preload("Members")

	err := tx.First(&group, "groups.id = ?", id).Error
	return group, err
}

func (r *BoardRepository) GetGroups(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]models.Member, error) {
	var members []models.Member
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&members).
		Limit(limit).
		Offset(offset).
		Error
	return members, err
}

func (r *BoardRepository) GetCommentsByBoard(ctx context.Context, boardID uuid.UUID, limit int, offset int) ([]models.BoardComment, error) {
	var comments []models.BoardComment

	err := r.db.
		WithContext(ctx).
		Find(&comments, "board_id = ?", boardID).
		Limit(limit).
		Offset(offset).
		Error

	return comments, err
}

func (r *BoardRepository) AddCommentToBoard(ctx context.Context, boardID uuid.UUID, userID uuid.UUID, message string) (*models.BoardComment, error) {
	comment := &models.BoardComment{
		BoardID: boardID,
		OwnerID: userID,
		Message: message,
	}

	if err := r.db.WithContext(ctx).Create(comment).Error; err != nil {
		return nil, err
	}

	return comment, nil
}

func (r *BoardRepository) DeleteCommentToBoardByID(ctx context.Context, commentID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("id = ?", commentID).
		Delete(&models.BoardComment{}).Error
}

func (r *BoardRepository) UpdateCommentToBoard(ctx context.Context, commentID uuid.UUID, newMessage string) (*models.BoardComment, error) {
	res := r.db.WithContext(ctx).
		Model(&models.BoardComment{}).
		Where("id = ?", commentID).
		Update("message", newMessage)

	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, fmt.Errorf("comment not found")
	}

	var updatedComment models.BoardComment
	err := r.db.WithContext(ctx).
		First(&updatedComment, "id = ?", commentID).Error
	if err != nil {
		return nil, err
	}

	return &updatedComment, nil
}

func (r *BoardRepository) GetOwnBoardsByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Board, error) {
	var boards []models.Board

	err := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id").
		Where("ot.type = ?", "user").
		Where("boards.owner_id = ?", userID).
		Find(&boards).
		Limit(limit).
		Offset(offset).
		Error

	return boards, err
}

func (r *BoardRepository) GetGroupBoardsByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Board, error) {
	var boards []models.Board

	userGroupsSubQuery := r.db.Model(&models.Member{}).
		Select("group_id").
		Where("user_id = ?", userID)

	ownerTypeGroupSubQuery := r.db.Model(&models.OwnerType{}).
		Select("id").
		Where("type = ?", "group")

	err := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Select("boards.*, al.type as access_level, ot.type as owner_type").
		Joins("LEFT JOIN access_levels as al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types as ot ON ot.id = boards.owner_type_id").
		Where("boards.owner_type_id = (?)", ownerTypeGroupSubQuery).
		Where("boards.owner_id IN (?)", userGroupsSubQuery).
		Find(&boards).
		Limit(limit).
		Offset(offset).
		Error

	return boards, err
}

func (r *BoardRepository) CountBoardsByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var boardsNumber int64

	err := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Joins("JOIN owner_types AS ot ON ot.id = boards.owner_type_id").
		Where("ot.type = ?", "user").
		Where("boards.owner_id = ?", userID).
		Count(&boardsNumber).Error

	if err != nil {
		return 0, err
	}

	return boardsNumber, nil
}

func (r *BoardRepository) CountGroupBoardsByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var boardsNumber int64

	userGroupsSubQuery := r.db.Model(&models.Member{}).
		Select("group_id").
		Where("user_id = ?", userID)

	ownerTypeGroupSubQuery := r.db.Model(&models.OwnerType{}).
		Select("id").
		Where("type = ?", "group")

	err := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Where("boards.owner_type_id = (?)", ownerTypeGroupSubQuery).
		Where("boards.owner_id IN (?)", userGroupsSubQuery).
		Count(&boardsNumber).Error

	if err != nil {
		return 0, err
	}

	return boardsNumber, nil

}
