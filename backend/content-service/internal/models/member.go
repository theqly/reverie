package models

import (
	"github.com/google/uuid"
)

type Member struct {
	UserID  uuid.UUID `gorm:"type:uuid;not null;primaryKey"`
	GroupID uuid.UUID `gorm:"type:uuid;not null;primaryKey"`

	Group Group `gorm:"foreignKey:GroupID;constraint:OnDelete:CASCADE"`
}
