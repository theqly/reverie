package models

import (
	"time"

	"github.com/google/uuid"
)

type Pin struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string    `gorm:"size:255;not null"`
	OwnerID     uuid.UUID `gorm:"type:uuid;not null"`
	Address     string
	Latitude    float64 `gorm:"not null"`
	Longitude   float64 `gorm:"not null"`
	Description string
	Rating      float64   `gorm:"default:0.0"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	PlaceID     uuid.UUID `gorm:"type:uuid"`

	Images  []string `gorm:"type:jsonb"`
	BoardID uuid.UUID
}

type BoardPin struct {
	BoardID uuid.UUID `gorm:"primaryKey"`
	PinID   uuid.UUID `gorm:"primaryKey"`
}

type Comment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	PinID     uuid.UUID `gorm:"type:uuid;not null"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	Content   string
	CreatedAt time.Time
}

type PinImage struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	OrderNumber int       `gorm:"not null"`
	PinID       uuid.UUID `gorm:"type:uuid;not null"`
	ImageURL    string    `gorm:"not null"`
}
