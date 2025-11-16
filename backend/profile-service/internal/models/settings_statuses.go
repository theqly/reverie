package models

import (
	"github.com/google/uuid"
)

type SettingsStatuses struct {
	ID          uuid.UUID `gorm:"primaryKey"`
	Type        string    `gorm:"unique;not null"`
	Description string
}
