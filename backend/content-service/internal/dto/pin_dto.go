package dto

import "github.com/google/uuid"

type PinRequest struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Lat         float64   `json:"lat"`
	Lng         float64   `json:"lng"`
	Images      []string  `json:"images"`
	Tags        []string  `json:"tags"`
	BoardID     uuid.UUID `json:"board_id"`
	AuthorID    uuid.UUID `json:"author_id"`
}

type PinResponse struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Lat         float64   `json:"lat"`
	Lng         float64   `json:"lng"`
	Images      []string  `json:"images"`
	Tags        []string  `json:"tags"`
	Rating      float64   `json:"rating"`
	BoardID     uuid.UUID `json:"board_id"`
	AuthorID    uuid.UUID `json:"author_id"`
}
