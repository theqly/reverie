package mapping

import (
	"profile-service/internal/db/models"
	"profile-service/internal/graph/model"
)

func MapUserToGraphQL(u *models.User) *model.User {
	return &model.User{
		ID:             u.ID.String(),
		Nickname:       u.Nickname,
		Email:          u.Email,
		ProfilePicture: u.ProfilePicture,
		Description:    u.Description,
		UserRating:     u.UserRating,
	}
}
