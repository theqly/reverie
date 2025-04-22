package mapper

import (
	"content-service/graph/model"
	"content-service/internal/models"
	"time"
)

func ToGraphQLBoard(b *models.Board) *model.Board {
	return &model.Board{
		ID:          b.ID,
		Name:        b.Name,
		AccessLevel: &model.AccessLevel{ID: b.AccessLevelID},
		Owner:       &model.User{ID: b.OwnerID},
		CreatedAt:   b.CreatedAt,
	}
}

func ToDomainBoard(input *model.CreateBoardInput) *models.Board {
	return &models.Board{
		Name:          input.Name,
		AccessLevelID: input.AccessLevelID,
		OwnerID:       input.OwnerID,
		CreatedAt:     time.Now(),
	}
}

func ToGraphQLPin(p *models.Pin) *model.Pin {
	return &model.Pin{
		ID:          p.ID,
		Name:        p.Name,
		Latitude:    p.Lat,
		Longitude:   p.Lng,
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

func ToDomainPin(input *model.CreatePinInput) *models.Pin {
	desc := ""
	if input.Description != nil {
		desc = *input.Description
	}
	return &models.Pin{
		Name:        input.Name,
		Lat:         input.Latitude,
		Lng:         input.Longitude,
		Description: desc,
		OwnerID:     input.OwnerID,
		CreatedAt:   time.Now(),
		Images:      []string{},
	}
}
