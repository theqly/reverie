package models

import (
	"github.com/google/uuid"
	"profile-service/graph/model"
)

type User struct {
	ID             uuid.UUID        `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Nickname       string           `gorm:"type:varchar(255);not null"`
	Email          string           `gorm:"type:varchar(255);unique;not null"`
	NickTag        string           `gorm:"type:varchar(255);not null"`
	ProfilePicture *string          `gorm:"type:text"`
	Description    *string          `gorm:"type:text"`
	UserRating     float64          `gorm:"default:0"`
	Status         model.UserStatus `gorm:"type:user_status;not nulldefault: 'active'"`
}
