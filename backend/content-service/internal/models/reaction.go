package models

import (
	"github.com/google/uuid"
)

type Reaction struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Type        string    `gorm:"size:255;not null"`
	Description string    `gorm:"size:255;not null"`
}

func (Reaction) TableName() string {
	return "reaction"
}
