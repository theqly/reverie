package repository

import (
	"context"
	"profile-service/graph/model"
	"profile-service/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db             *gorm.DB
	userStatusesDB map[string]struct{}
}

func getUserStatuses(db *gorm.DB) (map[string]struct{}, error) {
	var values []string

	query := `
		SELECT e.enumlabel
		FROM pg_enum e
		JOIN pg_type t ON e.enumtypid = t.oid
		WHERE t.typname = 'user_status'
		ORDER BY e.enumsortorder
	`

	err := db.Raw(query).Scan(&values).Error
	if err != nil {
		return nil, err
	}

	userStatusesDB := make(map[string]struct{}, len(values))
	for i := range values {
		userStatusesDB[values[i]] = struct{}{}

	}

	return userStatusesDB, nil
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	userStatusesDB, err := getUserStatuses(db)
	if err != nil {
		panic(err)
	}

	_, check := userStatusesDB[model.UserStatusDeleted.String()]
	if !check {
		panic("user status in graph/model does not match SQL user_status enum")
	}

	_, check = userStatusesDB[model.UserStatusActive.String()]
	if !check {
		panic("user status in graph/model does not match SQL user_status enum")
	}

	return &UserRepository{db: db, userStatusesDB: userStatusesDB}
}

func (r *UserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	return user, err
}

func (r *UserRepository) SoftDeleteUserByID(ctx context.Context, id uuid.UUID) error {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return err
	}

	user.Status = model.UserStatusDeleted

	return r.db.WithContext(ctx).Save(&user).Error
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

func (r *UserRepository) GetNumberOfFollowers(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Follower{}).Where("user_id = ?", userID).Count(&count).Error
	return int(count), err
}

func (r *UserRepository) GetNumberOfFollowings(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Follower{}).Where("follower_id = ?", userID).Count(&count).Error
	return int(count), err
}
