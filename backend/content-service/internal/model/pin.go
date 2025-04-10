package model

import (
	"github.com/google/uuid"
)

type Pin struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string
	Description string
	Lat         float64
	Lng         float64
	Images      []string `gorm:"type:jsonb"`
	Tags        []string `gorm:"type:jsonb"`
	Rating      float64
	BoardID     uuid.UUID `gorm:"type:uuid"`
	AuthorID    uuid.UUID `gorm:"type:uuid"`
}
