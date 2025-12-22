package mapper

import (
	model "profile-service/graph/model"
	"profile-service/internal/models"
)

func MapUserToGraphQL(u *models.User) *model.User {
	if u == nil {
		return nil
	}
	return &model.User{
		ID:             u.ID,
		Nickname:       u.Nickname,
		Email:          u.Email,
		NickTag:        u.NickTag,
		ProfilePicture: u.ProfilePicture,
		Description:    u.Description,
		UserRating:     u.UserRating,
		Status:         u.Status,
	}
}
