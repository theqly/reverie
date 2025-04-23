package models

import (
	"github.com/google/uuid"
)

type Follower struct {
	UserID     uuid.UUID `gorm:"type:uuid;not null;primaryKey"`
	FollowerID uuid.UUID `gorm:"type:uuid;not null;primaryKey"`

	User     User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Follower User `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE"`
}
