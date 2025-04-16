package model

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
	AuthorID    uuid.UUID `gorm:"type:uuid"`
	BoardID     uuid.UUID
	// Tags        []string `gorm:"type:jsonb"`
}
