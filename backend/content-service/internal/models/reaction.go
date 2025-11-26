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

type ReactionPin struct {
	ReactionID uuid.UUID `gorm:"primaryKey;column:reaction_id"`
	PinID      uuid.UUID `gorm:"primaryKey;column:pin_id"`
	OwnerID    uuid.UUID `gorm:"primaryKey;column:owner_id"`
}

func (ReactionPin) TableName() string {
	return "reaction_pins"
}

type ReactionBoard struct {
	ReactionID uuid.UUID `gorm:"primaryKey;column:reaction_id"`
	BoardID    uuid.UUID `gorm:"primaryKey;column:board_id"`
	OwnerID    uuid.UUID `gorm:"primaryKey;column:owner_id"`
}

func (ReactionBoard) TableName() string {
	return "reaction_boards"
}
