package repository

import (
	"context"
	"profile-service/graph/model"
	"profile-service/internal/models"

	"github.com/google/uuid"
	kafka "github.com/theqly/reverie/backend/kafka-module"
	events1 "github.com/theqly/reverie/backend/kafka-module/events/v1"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserRepository struct {
	db             *gorm.DB
	userStatusesDB map[string]struct{}
	publisher      *kafka.Producer
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

func NewUserRepository(db *gorm.DB, publisher *kafka.Producer) *UserRepository {
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

	return &UserRepository{db: db, userStatusesDB: userStatusesDB, publisher: publisher}
}

func (r *UserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	return user, err
}

func (r *UserRepository) SoftDeleteUserByID(ctx context.Context, id uuid.UUID) error {
	logger := zap.L().With(zap.String("repository", "SoftDeleteUserByID"))

	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return err
	}

	user.Status = model.UserStatusDeleted

	err = r.db.WithContext(ctx).Save(&user).Error

	if err == nil && r.publisher != nil {
		go func(UserID uuid.UUID) {
			event := events1.UserDeleted{
				BaseEvent: kafka.NewBaseEvent(),
				UserID:    UserID.String(),
			}
			if err := r.publisher.PublishUserDeleted(context.Background(), event); err != nil {
				logger.Info("failed to publish user.deleted event: %v", zap.String("err", err.Error()))
			}
		}(user.ID)
	}

	return err
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
	logger := zap.L().With(zap.String("repository", "CreateUser"))

	err := r.db.WithContext(ctx).Create(&user).Error

	if err == nil && r.publisher != nil {
		go func(u models.User) {
			event := events1.UserCreated{
				BaseEvent:   kafka.NewBaseEvent(),
				UserID:      u.ID.String(),
				Nickname:    u.Nickname,
				NickTag:     u.NickTag,
				Email:       u.Email,
				Description: *u.Description,
				UserRating:  u.UserRating,
				Status:      u.Status.String(),
			}
			if err := r.publisher.PublishUserCreated(context.Background(), event); err != nil {
				logger.Info("failed to publish user.created event: %v", zap.String("err", err.Error()))
			}
		}(user)
	}

	return err
}

func (r *UserRepository) SaveUser(ctx context.Context, user models.User) error {
	logger := zap.L().With(zap.String("repository", "SaveUser"))

	err := r.db.WithContext(ctx).Save(&user).Error

	if err == nil && r.publisher != nil {
		go func(u models.User) {
			event := events1.UserUpdated{
				BaseEvent:   kafka.NewBaseEvent(),
				UserID:      u.ID.String(),
				Nickname:    u.Nickname,
				NickTag:     u.NickTag,
				Description: *u.Description,
				UserRating:  u.UserRating,
				Status:      u.Status.String(),
			}
			if err := r.publisher.PublishUserUpdated(context.Background(), event); err != nil {
				logger.Info("failed to publish user.updated event: %v", zap.String("err", err.Error()))
			}
		}(user)
	}

	return err
}

func (r *UserRepository) GetFollow(ctx context.Context, userID uuid.UUID, followerID uuid.UUID) (models.Follower, error) {
	var follow models.Follower
	err := r.db.WithContext(ctx).First(&follow, "user_id = ? AND follower_id = ?", userID, followerID).Error
	return follow, err
}

func (r *UserRepository) CreateFollow(ctx context.Context, follow models.Follower) error {
	logger := zap.L().With(zap.String("repository", "CreateFollow"))

	err := r.db.WithContext(ctx).Create(&follow).Error

	if err == nil && r.publisher != nil {
		go func(u models.Follower) {
			event := events1.FollowCreated{
				BaseEvent:  kafka.NewBaseEvent(),
				UserID:     u.UserID.String(),
				FollowerID: u.FollowerID.String(),
			}
			if err := r.publisher.PublishFollowCreated(context.Background(), event); err != nil {
				logger.Info("failed to publish user.follow.created event: %v", zap.String("err", err.Error()))
			}
		}(follow)
	}

	return err
}

func (r *UserRepository) DeleteFollow(ctx context.Context, follow models.Follower) error {
	logger := zap.L().With(zap.String("repository", "DeleteFollow"))

	err := r.db.WithContext(ctx).Delete(&follow).Error

	if err == nil && r.publisher != nil {
		go func(u models.Follower) {
			event := events1.FollowDeleted{
				BaseEvent:  kafka.NewBaseEvent(),
				UserID:     u.UserID.String(),
				FollowerID: u.FollowerID.String(),
			}
			if err := r.publisher.PublishFollowDeleted(context.Background(), event); err != nil {
				logger.Info("failed to publish user.follow.deleted event: %v", zap.String("err", err.Error()))
			}
		}(follow)
	}

	return err
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
