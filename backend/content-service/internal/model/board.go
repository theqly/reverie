package model

import (
	"time"

	"github.com/google/uuid"
)

type Board struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name        string
	AccessLevel string
	OwnerID     uuid.UUID `gorm:"type:uuid"`
	CreateAt    time.Time
}
