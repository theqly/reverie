package mapping

import (
	"profile-service/internal/db/models"
	"profile-service/internal/graph/model"
)

func MapUserToGraphQL(u *models.User) *model.User {
	if u == nil {
		return nil
	}
	return &model.User{
		ID:             u.ID.String(),
		Nickname:       u.Nickname,
		Email:          u.Email,
		ProfilePicture: u.ProfilePicture,
		Description:    u.Description,
		UserRating:     u.UserRating,
	}
}

func MapGroupToGraphQL(group *models.Group, members []models.Member) *model.Group {
	var graphqlMembers []*model.User
	for _, m := range members {
		graphqlMembers = append(graphqlMembers, MapUserToGraphQL(&m.User))
	}

	return &model.Group{
		ID:      group.ID.String(),
		Members: graphqlMembers,
	}
}
