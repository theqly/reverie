package models

import (
)

type SettingsStatuses struct {
	ID          int    `gorm:"primaryKey"`
	Type        string    `gorm:"unique;not null"`
	Description string
}
