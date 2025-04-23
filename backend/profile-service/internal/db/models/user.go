package models

import (
	"github.com/google/uuid"
)

type User struct {
	ID             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Nickname       string    `gorm:"type:varchar(255);not null"`
	Email          string    `gorm:"type:varchar(255);unique;not null"`
	HashedPassword string    `gorm:"type:varchar(255);not null"`
	ProfilePicture *string   `gorm:"type:text"`
	Description    *string   `gorm:"type:text"`
	UserRating     float64   `gorm:"default:0"`

	Followers []Follower `gorm:"foreignKey:UserID"`
	Following []Follower `gorm:"foreignKey:FollowerID"`

	Groups []Member `gorm:"foreignKey:UserID"`
}
