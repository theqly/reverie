package models

import (
	"time"

	"github.com/google/uuid"
)

type Pin struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name        string
	Lat         float64
	Lng         float64
	Description string
	Images      []string `gorm:"type:jsonb"`
	Rating      float64
	CreatedAt   time.Time
	OwnerID     uuid.UUID `gorm:"type:uuid"`
	BoardID     uuid.UUID
	// Tags        []string `gorm:"type:jsonb"`
}

type BoardPin struct {
	BoardID uuid.UUID `gorm:"primaryKey"`
	PinID   uuid.UUID `gorm:"primaryKey"`
}

type Comment struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	PinID     uuid.UUID
	UserID    uuid.UUID
	Content   string
	CreatedAt time.Time
}

type PinImage struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	PinID       uuid.UUID
	ImageURL    string
	OrderNumber int
}
