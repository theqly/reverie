package model

import (
	"github.com/google/uuid"
)

type Board struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title        string
	OwnerID      uuid.UUID `gorm:"type:uuid"`
	Visibility   string
	GroupEditors []uuid.UUID `gorm:"type:jsonb"`
}
