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
	Description   string
	AccessLevelID int       `gorm:"not null"`
	OwnerID       uuid.UUID `gorm:"type:uuid;not null"`
	OwnerTypeID   int       `gorm:"not null"`
	CreatedAt     time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	// Опциональные поля, которые будут инициализировать только в том случае, если при graphQL запросе были указаны явно
	Pins []*Pin `gorm:"many2many:board_pins;"`

	// `gorm:"->"` означает, что эти поля для чтения
	AccessLevel string `gorm:"->"`
	OwnerType   string `gorm:"->"`
}

func (Board) TableName() string {
	return "boards"
}

type BoardComment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	BoardID   uuid.UUID `gorm:"type:uuid;not null;constraint:OnDelete:CASCADE"`
	OwnerID   uuid.UUID `gorm:"type:uuid;not null"`
	Message   string    `gorm:"type:text;not null"`
	CreatedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP"`
}

func (BoardComment) TableName() string {
	return "board_comments"
}
