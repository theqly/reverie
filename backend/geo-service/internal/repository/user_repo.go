package repository

import (
	"gorm.io/gorm"
)

type GeoRepository struct {
	db *gorm.DB
}

func NewGeoRepository(db *gorm.DB) *GeoRepository {
	return &GeoRepository{db: db}
}
