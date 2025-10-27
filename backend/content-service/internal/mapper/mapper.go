package mapper

import (
	"content-service/graph/model"
	"content-service/internal/models"
)

func ToGraphQLBoard(b *models.Board) *model.Board {
	return &model.Board{
		ID:          b.ID,
		Name:        b.Name,
		AccessLevel: &model.AccessLevel{ID: b.AccessLevelID, Type: b.AccessLevel},
		OwnerID:     b.OwnerID,
		OwnerType:   &model.OwnerType{ID: b.OwnerTypeID, Type: b.OwnerType},
		CreatedAt:   b.CreatedAt,
	}
}

func CreateToDomainBoard(input *model.CreateBoardInput) *models.Board {
	return &models.Board{
		Name:          input.Name,
		AccessLevelID: input.AccessLevelID,
		OwnerID:       input.OwnerID,
		OwnerTypeID:   input.OwnerTypeID,
	}
}

func UpdateToDomainBoard(input *model.UpdateBoardInput) *models.Board {
	board := models.Board{}
	if input.Name != nil {
		board.Name = *input.Name
	}
	if input.AccessLevelID != nil {
		board.AccessLevelID = *input.AccessLevelID
	}
	return &board
}

func ToGraphQLPin(p *models.Pin) *model.Pin {
	return &model.Pin{
		ID:          p.ID,
		Name:        p.Name,
		Latitude:    p.Latitude,
		Longitude:   p.Longitude,
		Description: &p.Description,
		Rating:      p.Rating,
		CreatedAt:   p.CreatedAt,
		Owner:       &model.User{ID: p.OwnerID},
		Images:      toGraphQLImages(p.Images),
		// TODO: Comments, Tags
	}
}

func toGraphQLImages(imgs []string) []*model.PinImage {
	images := make([]*model.PinImage, 0, len(imgs))
	for i, url := range imgs {
		images = append(images, &model.PinImage{
			ImageURL:    url,
			OrderNumber: i,
		})
	}
	return images
}

func UpdateToDomainPin(input *model.UpdatePinInput) *models.Pin {
	pin := models.Pin{}

	if input.Name != nil {
		pin.Name = *input.Name
	}
	if input.Latitude != nil {
		pin.Latitude = *input.Latitude
	}
	if input.Longitude != nil {
		pin.Longitude = *input.Longitude
	}
	if input.Description != nil {
		pin.Description = *input.Description
	}
	if input.Rating != nil {
		pin.Rating = *input.Rating
	}

	return &pin
}

func CreateToDomainPin(input *model.CreatePinInput) *models.Pin {
	desc := ""
	if input.Description != nil {
		desc = *input.Description
	}
	return &models.Pin{
		Name:        input.Name,
		Latitude:    input.Latitude,
		Longitude:   input.Longitude,
		Description: desc,
		OwnerID:     input.OwnerID,
		Images:      []string{},
	}
}

func ToGraphQLComment(c *models.Comment) *model.Comment {
	return &model.Comment{
		ID:        c.ID,
		Content:   c.Content,
		CreatedAt: c.CreatedAt,
		Author:    &model.User{ID: c.UserID},
	}
}

func ToGraphQLPinImage(p *models.PinImage) *model.PinImage {
	return &model.PinImage{
		ID:          p.ID,
		OrderNumber: p.OrderNumber,
		ImageURL:    p.ImageURL,
	}
}
