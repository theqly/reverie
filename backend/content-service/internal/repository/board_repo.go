package repository

import (
	"content-service/graph/model"
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

type BoardRepository struct {
	db        *gorm.DB
	publisher *kafka.Producer
}

func NewBoardRepository(db *gorm.DB, publisher *kafka.Producer) *BoardRepository {
	return &BoardRepository{db: db, publisher: publisher}
}

func (r *BoardRepository) Create(ctx context.Context, board models.Board) error {
	logger := zap.L().With(zap.String("repository", "CreateBoard"))

	err := r.db.WithContext(ctx).Create(&board).Error

	var members []models.Member

	if board.OwnerType == model.AccessLevelTypeGroup.String() || board.OwnerType == model.AccessLevelTypeGroupPublic.String() {
		var err1 error
		members, err1 = r.GetMembers(ctx, board.OwnerID)
		if err1 != nil {
			members = nil
		}
	}

	if err == nil && r.publisher != nil {
		go func(b models.Board, members []models.Member) {
			// full_b := mapper.ToGraphQLBoard(&b) TODO: точно ли отправляется OwnerType?

			event := events1.BoardCreated{
				BaseEvent:   kafka.NewBaseEvent(),
				BoardID:     b.ID.String(),
				Name:        b.Name,
				AccessLevel: b.AccessLevel,
				OwnerID:     b.OwnerID.String(),
				OwnerType:   b.OwnerType,
				CreatedAt:   b.CreatedAt,
			}

			if members != nil {
				groupMemberIDs := make([]string, 0, len(members))
				for _, member := range members {
					groupMemberIDs = append(groupMemberIDs, member.UserID.String())
				}

				event.GroupMemberIDs = groupMemberIDs
			}

			if err := r.publisher.PublishBoardCreated(context.Background(), event); err != nil {
				logger.Info("failed to publish board.created event: %v", zap.String("err", err.Error()))
			}
		}(board, members)
	}

	return err
}

func (r *BoardRepository) baseBoardQuery(ctx context.Context, viewerID *uuid.UUID) *gorm.DB {
	selectQuery := "boards.*, al.type AS access_level, ot.type AS owner_type"

	tx := r.db.WithContext(ctx).
		Model(&models.Board{}).
		Joins("LEFT JOIN access_levels AS al ON al.id = boards.access_level_id").
		Joins("LEFT JOIN owner_types AS ot ON ot.id = boards.owner_type_id")

	if viewerID != nil {
		selectQuery += ", rb.reaction_id, (bb.board_id IS NOT NULL) as bookmarked"

		tx = tx.Joins("LEFT JOIN reaction_boards AS ON rb.board_id = boards.id AND rb.owner_id = ?", viewerID)
		tx = tx.Joins("LEFT JOIN bookmarks_boards AS ON bb.board_id = boards.id AND bb.user_id = ?", viewerID)
	}

	return tx.Select(selectQuery)
}

func (r *BoardRepository) GetByID(ctx context.Context, id uuid.UUID, viewerID *uuid.UUID) (models.Board, error) {
	var board models.Board

	tx := r.baseBoardQuery(ctx, viewerID)

	requestedFields := utils.DoesItNeedFields(ctx, "pins")
	if requestedFields != nil && requestedFields["pins"] {
		tx = tx.Preload("Pins")
	}

	err := tx.First(&board, "boards.id = ?", id).Error
	return board, err
}

func (r *BoardRepository) GetByName(ctx context.Context, name string, viewerID *uuid.UUID, limit int, offset int) ([]models.Board, error) {
	var boards []models.Board

	tx := r.baseBoardQuery(ctx, viewerID).Order("boards.id DESC").Limit(limit).Offset(offset)

	requestedFields := utils.DoesItNeedFields(ctx, "pins")
	if requestedFields != nil && requestedFields["pins"] {
		tx = tx.Preload("Pins")
	}

	err := tx.Where("boards.name = ?", name).Find(&boards).Error
	return boards, err
}

func (r *BoardRepository) GetByGroup(ctx context.Context, groupID uuid.UUID, viewerID *uuid.UUID, limit int, offset int) ([]models.Board, error) {
	var boards []models.Board

	tx := r.baseBoardQuery(ctx, viewerID).Order("boards.id DESC").Limit(limit).Offset(offset)

	subQuery := r.db.Model(&models.OwnerType{}).Select("id").Where("type = ?", "group") // ??? пока что подзапросом

	err := tx.Where("boards.owner_type_id = (?) AND boards.owner_id = ?", subQuery, groupID).Find(&boards).Error
	return boards, err
}

func (r *BoardRepository) Update(ctx context.Context, updated models.Board) error {
	logger := zap.L().With(zap.String("repository", "UpdateBoard"))

	err := r.db.WithContext(ctx).Model(&models.Board{}).
		Where("id = ?", updated.ID).
		Updates(map[string]interface{}{
			"name":            updated.Name,
			"access_level_id": updated.AccessLevelID,
		}).Error

	if r.publisher != nil {
		go func(b models.Board) {
			event := events1.BoardUpdated{
				BaseEvent:   kafka.NewBaseEvent(),
				BoardID:     b.ID.String(),
				Name:        b.Name,
				AccessLevel: b.AccessLevel,
			}
			if err := r.publisher.PublishBoardUpdated(context.Background(), event); err != nil {
				logger.Info("failed to publish board.updated event: %v", zap.String("err", err.Error()))
			}
		}(updated)
	}

	return err
}

func (r *BoardRepository) AddPinToBoard(ctx context.Context, pinID uuid.UUID, boardID uuid.UUID) (*models.Board, error) {
	logger := zap.L().With(zap.String("repository", "AddPinToBoard"))

	err := r.db.WithContext(ctx).Create(&models.BoardPin{
		BoardID: boardID,
		PinID:   pinID,
	}).Error

	if err != nil {
		return nil, err
	}

	if r.publisher != nil {
		go func(pinID uuid.UUID, boardID uuid.UUID) {
			event := events1.BoardPinsAdded{
				BaseEvent: kafka.NewBaseEvent(),
				BoardID:   boardID.String(),
				PinIDs:    []string{pinID.String()},
			}
			if err := r.publisher.PublishBoardPinsAdded(context.Background(), event); err != nil {
				logger.Info("failed to publish board.pin.added event: %v", zap.String("err", err.Error()))
			}
		}(pinID, boardID)
	}

	board, err := r.GetByID(ctx, boardID, nil)

	return &board, err
}

func (r *BoardRepository) RemovePinFromBoard(ctx context.Context, pinID uuid.UUID, boardID uuid.UUID) (*models.Board, error) {
	logger := zap.L().With(zap.String("repository", "RemovePinFromBoard"))

	err := r.db.WithContext(ctx).
		Where("board_id = ? AND pin_id = ?", boardID, pinID).
		Delete(&models.BoardPin{}).Error

	if err != nil {
		return nil, err
	}

	if r.publisher != nil {
		go func(pinID uuid.UUID, boardID uuid.UUID) {
			event := events1.BoardPinsDeleted{
				BaseEvent: kafka.NewBaseEvent(),
				BoardID:   boardID.String(),
				PinIDs:    []string{pinID.String()},
			}
			if err := r.publisher.PublishBoardPinsDeleted(context.Background(), event); err != nil {
				logger.Info("failed to publish board.pin.deleted event: %v", zap.String("err", err.Error()))
			}
		}(pinID, boardID)
	}

	board, err := r.GetByID(ctx, boardID, nil)

	return &board, err
}

func (r *BoardRepository) CreateGroup(ctx context.Context, members []uuid.UUID) (*models.Group, error) {
	logger := zap.L().With(zap.String("repository", "CreateGroup"))

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

	if r.publisher != nil {
		go func(members []uuid.UUID, fullGroup models.Group) {
			event := events1.BoardGroupMembersAdded{
				BaseEvent: kafka.NewBaseEvent(),
				BoardID:   fullGroup.ID.String(),
			}

			if members != nil {
				groupMemberIDs := make([]string, 0, len(members))
				for _, member := range members {
					groupMemberIDs = append(groupMemberIDs, member.String())
				}

				event.GroupMemberIDs = groupMemberIDs
			}

			if err := r.publisher.PublishBoardGroupMembersAdded(context.Background(), event); err != nil {
				logger.Info("failed to publish board.member.created event: %v", zap.String("err", err.Error()))
			}
		}(members, *fullGroup)
	}

	return fullGroup, nil
}

func (r *BoardRepository) CreateMember(ctx context.Context, member models.Member) error {
	logger := zap.L().With(zap.String("repository", "CreateMember"))

	err := r.db.WithContext(ctx).Create(&member).Error

	if err == nil && r.publisher != nil {
		go func(member models.Member) {
			event := events1.BoardGroupMembersAdded{
				BaseEvent:      kafka.NewBaseEvent(),
				BoardID:        member.GroupID.String(),
				GroupMemberIDs: []string{member.UserID.String()},
			}
			if err := r.publisher.PublishBoardGroupMembersAdded(context.Background(), event); err != nil {
				logger.Info("failed to publish board.member.created event: %v", zap.String("err", err.Error()))
			}
		}(member)
	}

	return err
}

func (r *BoardRepository) GetMembers(ctx context.Context, groupID uuid.UUID) ([]models.Member, error) {
	var members []models.Member
	result := r.db.WithContext(ctx).Find(&members, "group_id = ?", groupID)

	if result.Error != nil {
		return nil, result.Error
	}

	return members, nil
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
	logger := zap.L().With(zap.String("repository", "RemoveUserFromGroup"))

	err := r.db.WithContext(ctx).Delete(&member).Error

	if err == nil && r.publisher != nil {
		go func(member models.Member) {
			event := events1.BoardGroupMembersDeleted{
				BaseEvent:      kafka.NewBaseEvent(),
				BoardID:        member.GroupID.String(),
				GroupMemberIDs: []string{member.UserID.String()},
			}
			if err := r.publisher.PublishBoardGroupMembersDeleted(context.Background(), event); err != nil {
				logger.Info("failed to publish board.member.deleted event: %v", zap.String("err", err.Error()))
			}
		}(member)
	}

	return err
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
		Order("group_id ASC").
		Limit(limit).
		Offset(offset).
		Find(&members).
		Error
	return members, err
}

func (r *BoardRepository) GetCommentsByBoard(ctx context.Context, boardID uuid.UUID, limit int, offset int) ([]models.BoardComment, error) {
	var comments []models.BoardComment

	err := r.db.
		WithContext(ctx).
		Order("id DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments, "board_id = ?", boardID).
		Error

	return comments, err
}

func (r *BoardRepository) AddCommentToBoard(ctx context.Context, boardID uuid.UUID, userID uuid.UUID, message string) (*models.BoardComment, error) {
	logger := zap.L().With(zap.String("repository", "AddCommentToBoard"))

	comment := &models.BoardComment{
		BoardID:   boardID,
		OwnerID:   userID,
		Message:   message,
		CreatedAt: time.Now(),
	}

	err := r.db.WithContext(ctx).Create(comment).Error
	if err != nil {
		return nil, err
	}

	if r.publisher != nil {
		go func(b models.BoardComment) {
			event := events1.BoardCommented{
				BaseEvent: kafka.NewBaseEvent(),
				BoardID:   b.BoardID.String(),
				CommentID: b.ID.String(),
				OwnerID:   b.OwnerID.String(),
				Message:   b.Message,
				CreatedAt: b.CreatedAt,
			}
			if err := r.publisher.PublishBoardCommented(context.Background(), event); err != nil {
				logger.Info("failed to publish board.comment.created event: %v", zap.String("err", err.Error()))
			}
		}(*comment)
	}

	return comment, nil
}

func (r *BoardRepository) DeleteCommentToBoardByID(ctx context.Context, commentID uuid.UUID) error {
	logger := zap.L().With(zap.String("repository", "DeleteCommentToBoardByID"))

	err := r.db.WithContext(ctx).
		Where("id = ?", commentID).
		Delete(&models.BoardComment{}).Error

	if err == nil && r.publisher != nil {
		go func(commentID uuid.UUID) {
			event := events1.BoardCommentDeleted{
				BaseEvent: kafka.NewBaseEvent(),
				CommentID: commentID.String(),
			}
			if err := r.publisher.PublishBoardCommentDeleted(context.Background(), event); err != nil {
				logger.Info("failed to publish board.comment.deleted event: %v", zap.String("err", err.Error()))
			}
		}(commentID)
	}

	return err
}

func (r *BoardRepository) UpdateCommentToBoard(ctx context.Context, commentID uuid.UUID, newMessage string) (*models.BoardComment, error) {
	logger := zap.L().With(zap.String("repository", "UpdateCommentToBoard"))

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

	if r.publisher != nil {
		go func(commentID uuid.UUID, newMessage string) {
			event := events1.BoardCommentUpdated{
				BaseEvent: kafka.NewBaseEvent(),
				CommentID: commentID.String(),
				Message:   newMessage,
			}
			if err := r.publisher.PublishBoardCommentUpdated(context.Background(), event); err != nil {
				logger.Info("failed to publish board.comment.updated event: %v", zap.String("err", err.Error()))
			}
		}(commentID, newMessage)
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
		Order("boards.id DESC").
		Limit(limit).
		Offset(offset).
		Find(&boards).
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
		Order("boards.id DESC").
		Limit(limit).
		Offset(offset).
		Find(&boards).
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
