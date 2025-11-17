package mapper

import (
	"content-service/graph/model"
	"content-service/internal/models"
	"fmt"

	"gorm.io/gorm"
)

var accessLevelToID map[model.AccessLevelType]int
var idToAccessLevelType map[int]model.AccessLevelType

var ownerTypeToID map[model.OwnerType]int
var idToOwnerType map[int]model.OwnerType

func LoadMappings(db *gorm.DB) error {
	// 1. Загрузка Access Levels
	var accessLevels []models.AccessLevel
	if err := db.Find(&accessLevels).Error; err != nil {
		return fmt.Errorf("failed to load access levels: %w", err) // log
	}

	accessLevelToID = make(map[model.AccessLevelType]int)
	idToAccessLevelType = make(map[int]model.AccessLevelType)
	for _, level := range accessLevels {
		gqlType := model.AccessLevelType(level.Type)
		accessLevelToID[gqlType] = level.ID
		idToAccessLevelType[level.ID] = gqlType
	}
	fmt.Printf("Loaded %d access level mappings\n", len(accessLevelToID)) // log

	// 2. Загрузка Owner Types
	var ownerTypes []models.OwnerType
	if err := db.Find(&ownerTypes).Error; err != nil {
		return fmt.Errorf("failed to load owner types: %w", err) // log
	}

	ownerTypeToID = make(map[model.OwnerType]int)
	idToOwnerType = make(map[int]model.OwnerType)
	for _, ownerType := range ownerTypes {
		gqlType := model.OwnerType(ownerType.Type)
		ownerTypeToID[gqlType] = ownerType.ID
		idToOwnerType[ownerType.ID] = gqlType
	}
	fmt.Printf("Loaded %d owner type mappings\n", len(ownerTypeToID)) // log

	return nil
}

func toGraphQlSlicePin(pins []*models.Pin) []*model.Pin {
	if len(pins) == 0 {
		return nil
	}
	graphqlPins := make([]*model.Pin, 0, len(pins))
	for _, pin := range pins {
		graphqlPins = append(graphqlPins, ToGraphQLPin(pin))
	}
	return graphqlPins
}

func ToGraphQLBoard(b *models.Board) *model.Board {
	return &model.Board{
		ID:          b.ID,
		Name:        b.Name,
		AccessLevel: model.AccessLevelType(b.AccessLevel),
		OwnerID:     b.OwnerID,
		OwnerType:   model.OwnerType(b.OwnerType),
		CreatedAt:   b.CreatedAt,
		Pins:        toGraphQlSlicePin(b.Pins),
	}
}

func CreateToDomainBoard(input *model.CreateBoardInput) *models.Board {
	return &models.Board{
		Name:          input.Name,
		AccessLevelID: accessLevelToID[input.AccessLevel],
		OwnerID:       input.OwnerID,
		OwnerTypeID:   ownerTypeToID[input.OwnerType],
	}
}

func UpdateToDomainBoard(input *model.UpdateBoardInput) *models.Board {
	board := models.Board{}
	if input.Name != nil {
		board.Name = *input.Name
	}
	if input.AccessLevel != nil {
		board.AccessLevelID = accessLevelToID[*input.AccessLevel]
	}
	return &board
}

func ToGraphQLPin(p *models.Pin) *model.Pin {
	return &model.Pin{
		ID:    p.ID,
		Name:  p.Name,
		Owner: &model.User{ID: p.OwnerID},
		// Address:     p.Address,
		Latitude:    p.Latitude,
		Longitude:   p.Longitude,
		Description: &p.Description,
		Rating:      p.Rating,
		CreatedAt:   p.CreatedAt,
		Images:      toGraphQLImages(p.Images),
		// TODO: Comments, Place
	}
}

func toGraphQLImages(imgs []models.PinImage) []*model.PinImage {
	if len(imgs) == 0 {
		return nil
	}

	images := make([]*model.PinImage, 0, len(imgs))
	for _, img := range imgs {
		images = append(images, &model.PinImage{
			ID:          img.ID,
			OrderNumber: img.OrderNumber,
			ImageURL:    img.ImageURL,
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
		OwnerID:     input.OwnerID,
		Latitude:    input.Latitude,
		Longitude:   input.Longitude,
		Description: desc,
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

func ToGraphQLGroup(group *models.Group, members []models.Member) *model.Group {
	var graphqlMembers []*model.User
	for _, m := range members {
		graphqlMembers = append(graphqlMembers, &model.User{ID: m.UserID})
	}

	return &model.Group{
		ID:      group.ID,
		Members: graphqlMembers,
	}
}
