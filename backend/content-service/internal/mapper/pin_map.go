package mapper

import (
	"content-service/internal/dto"
	"content-service/internal/model"

	"github.com/google/uuid"
)

func ToPinModel(req dto.PinRequest) model.Pin {
	return model.Pin{
		ID:          uuid.New(),
		Title:       req.Title,
		Description: req.Description,
		Lat:         req.Lat,
		Lng:         req.Lng,
		Images:      req.Images,
		Tags:        req.Tags,
		BoardID:     req.BoardID,
		AuthorID:    req.AuthorID,
		Rating:      0,
	}
}

func ToPinResponse(pin model.Pin) dto.PinResponse {
	return dto.PinResponse{
		ID:          pin.ID,
		Title:       pin.Title,
		Description: pin.Description,
		Lat:         pin.Lat,
		Lng:         pin.Lng,
		Images:      pin.Images,
		Tags:        pin.Tags,
		Rating:      pin.Rating,
		BoardID:     pin.BoardID,
		AuthorID:    pin.AuthorID,
	}
}
