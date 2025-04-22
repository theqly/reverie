package models

import (
	"time"

	"github.com/google/uuid"
)

type Board struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name          string
	AccessLevelID uuid.UUID
	OwnerID       uuid.UUID `gorm:"type:uuid"`
	CreatedAt     time.Time
}
