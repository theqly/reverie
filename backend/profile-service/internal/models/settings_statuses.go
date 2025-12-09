package models

type SettingsStatuses struct {
	ID          int     `gorm:"primaryKey"`
	Type        string  `gorm:"size:255;unique;not null"`
	Description *string `gorm:"type:text"`
}
