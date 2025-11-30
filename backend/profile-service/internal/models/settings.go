package models

import (
	"github.com/google/uuid"
)

type Settings struct {
	UserID            uuid.UUID `gorm:"type:uuid;not null;primaryKey"`
	BookmarksStatusID int       `gorm:"type:int;not null"`
}

