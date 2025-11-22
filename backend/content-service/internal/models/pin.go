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

	PlaceID *uuid.UUID `gorm:"type:uuid"`
	Images  []PinImage `gorm:"foreignKey:PinID"`
	// BoardID uuid.UUID
}

func (Pin) TableName() string {
	return "pins"
}

type BoardPin struct {
	BoardID uuid.UUID `gorm:"primaryKey"`
	PinID   uuid.UUID `gorm:"primaryKey"`
}

func (BoardPin) TableName() string {
	return "board_pins"
}

type PinComment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	PinID     uuid.UUID `gorm:"type:uuid;not null;constraint:OnDelete:CASCADE"`
	OwnerID   uuid.UUID `gorm:"type:uuid;not null"`
	Message   string    `gorm:"type:text;not null"`
	CreatedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP"`
}

func (PinComment) TableName() string {
	return "pin_comments"
}

type PinImage struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	OrderNumber int       `gorm:"not null"`
	ImageURL    string    `gorm:"not null"`
	PinID       uuid.UUID `gorm:"type:uuid;not null"`
}

func (PinImage) TableName() string {
	return "pin_images"
}
