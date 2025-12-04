package models

import (
	"github.com/google/uuid"
)

type BookmarkPin struct {
	UserID uuid.UUID `gorm:"type:uuid;primaryKey;column:user_id"`
	PinID  uuid.UUID `gorm:"type:uuid;primaryKey;column:pin_id"`
}

func (BookmarkPin) TableName() string {
	return "bookmarks_pins"
}

type BookmarkBoard struct {
	UserID  uuid.UUID `gorm:"type:uuid;primaryKey;column:user_id"`
	BoardID uuid.UUID `gorm:"type:uuid;primaryKey;column:board_id"`
}

func (BookmarkBoard) TableName() string {
	return "bookmarks_boards"
}
