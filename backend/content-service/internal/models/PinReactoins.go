package models

import "github.com/google/uuid"

type ReactionPin struct {
	ReactionID uuid.UUID `gorm:"primaryKey;column:reaction_id"`
	PinID      uuid.UUID `gorm:"primaryKey;column:pin_id"`
	OwnerID    uuid.UUID `gorm:"primaryKey;column:owner_id"`
}

func (ReactionPin) TableName() string {
	return "reaction_pins"
}
