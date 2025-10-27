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

	// Опциональные поля, которые будут инициализировать только в том случае, если при запросе были указаны явно
	// Если в graphQL запросе этих полей не было, то и обращения в БД не будет
	Pins        []*Pin
	AccessLevel string
	OwnerType   string
}
