package dto

import (
	"time"

	"github.com/google/uuid"
)

type BoardRequest struct {
	Name        string    `json:"name"`
	AccessLevel string    `json:"access_level"`
	OwnerID     uuid.UUID `json:"owner_id"`
	CreateAt    time.Time `json:"create_at"`
}

type BoardResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	AccessLevel string    `json:"access_level"`
	OwnerID     uuid.UUID `json:"owner_id"`
	CreateAt    time.Time `json:"create_at"`
}
