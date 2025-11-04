package models

import (
	"time"

	"github.com/google/uuid"
)

type AccessLevel struct {
	ID   int    `gorm:"primaryKey;serial"`
	Type string `gorm:"size:255;not null;unique"`
}

type OwnerType struct {
	ID   int    `gorm:"primaryKey;serial"`
	Type string `gorm:"size:255;not null;unique"`
}

type Board struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name          string    `gorm:"size:255;not null"`
	AccessLevelID int       `gorm:"not null"`
	OwnerID       uuid.UUID `gorm:"type:uuid;not null"`
	OwnerTypeID   int       `gorm:"not null"`
	CreatedAt     time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	// Опциональные поля, которые будут инициализировать только в том случае, если при graphQL запросе были указаны явно
	Pins []*Pin `gorm:"many2many:board_pins;"`

	AccessLevel string
	OwnerType   string
}

func (Board) TableName() string {
	return "boards"
}
