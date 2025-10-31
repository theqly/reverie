package repository

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"profile-service/graph/model"
	"profile-service/internal/models"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	return user, err
}

func (r *UserRepository) getUserStatuses() (map[string]struct{}, error) {
	var values map[string]struct{}

	query := `
		SELECT e.enumlabel
		FROM pg_enum e
		JOIN pg_type t ON e.enumtypid = t.oid
		WHERE t.typname = 'user_status'
		ORDER BY e.enumsortorder
	`

	err := r.db.Raw(query).Scan(&values).Error
	if err != nil {
		return nil, err
	}

	return values, nil
}

var userStatusesDB map[string]struct{}

func (r *UserRepository) SoftDeleteUserByID(ctx context.Context, id uuid.UUID) error {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return err
	}

	if userStatusesDB == nil {
		userStatusesDB, err = r.getUserStatuses()
		if err != nil {
			return err
		}
	}

	if !isStatusValid(model.UserStatusDeleted.String()) {
		return fmt.Errorf("user status in graph/model does not match SQL user_status enum: %s", user.Status)
	}

	user.Status = model.UserStatusDeleted

	return r.db.WithContext(ctx).Save(&user).Error
}

func isStatusValid(status string) bool {
	_, ok := userStatusesDB[status]
	return ok
}

func (r *UserRepository) GetUserByNickname(ctx context.Context, nickname string) (models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "nickname = ?", nickname).Error
	return user, err
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error
	return user, err
}

func (r *UserRepository) CreateUser(ctx context.Context, user models.User) error {
	return r.db.WithContext(ctx).Create(&user).Error
}

func (r *UserRepository) SaveUser(ctx context.Context, user models.User) error {
	return r.db.WithContext(ctx).Save(&user).Error
}

func (r *UserRepository) GetFollow(ctx context.Context, userID uuid.UUID, followerID uuid.UUID) (models.Follower, error) {
	var follow models.Follower
	err := r.db.WithContext(ctx).First(&follow, "user_id = ? AND follower_id = ?", userID, followerID).Error
	return follow, err
}

func (r *UserRepository) CreateFollow(ctx context.Context, follow models.Follower) error {
	return r.db.WithContext(ctx).Create(&follow).Error
}

func (r *UserRepository) DeleteFollow(ctx context.Context, follow models.Follower) error {
	return r.db.WithContext(ctx).Delete(&follow).Error
}

func (r *UserRepository) CreateGroup(ctx context.Context, group models.Group) error {
	return r.db.WithContext(ctx).Create(&group).Error
}

func (r *UserRepository) CreateMember(ctx context.Context, member models.Member) error {
	return r.db.WithContext(ctx).Create(&member).Error
}

func (r *UserRepository) GetMember(ctx context.Context, userID uuid.UUID, groupID uuid.UUID) (models.Member, error) {
	var member models.Member
	err := r.db.WithContext(ctx).First(&member, "user_id = ? AND group_id = ?", userID, groupID).Error
	return member, err
}

func (r *UserRepository) RemoveUserFromGroup(ctx context.Context, member models.Member) error {
	return r.db.WithContext(ctx).Delete(&member).Error
}

func (r *UserRepository) GetFollowers(ctx context.Context, userID uuid.UUID) ([]models.Follower, error) {
	var followerLinks []models.Follower
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&followerLinks).Error
	return followerLinks, err
}

func (r *UserRepository) GetFollowings(ctx context.Context, userID uuid.UUID) ([]models.Follower, error) {
	var followingLinks []models.Follower
	err := r.db.WithContext(ctx).Where("follower_id = ?", userID).Find(&followingLinks).Error
	return followingLinks, err
}

func (r *UserRepository) GetGroupByID(ctx context.Context, id uuid.UUID) (models.Group, error) {
	var group models.Group
	err := r.db.WithContext(ctx).First(&group, "id = ?", id).Error
	return group, err
}

func (r *UserRepository) GetMembers(ctx context.Context, groupID uuid.UUID) ([]models.Member, error) {
	var members []models.Member
	err := r.db.WithContext(ctx).Where("group_id = ?", groupID).Find(&members).Error
	return members, err
}

func (r *UserRepository) GetGroups(ctx context.Context, userID uuid.UUID) ([]models.Member, error) {
	var members []models.Member
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&members).Error
	return members, err
}
