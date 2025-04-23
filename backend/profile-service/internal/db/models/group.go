package models

import (
	"github.com/google/uuid"
)

type Group struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Members []Member `gorm:"foreignKey:GroupID"`
}
