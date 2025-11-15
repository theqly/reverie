package service

import (
	"context"
	"fmt"
	"geo-service/internal/models"
)

type GeoService struct {
	geocoder models.Geocoder
	cache    models.Cache
}

func NewGeoService(geocoder models.Geocoder, cache models.Cache) *GeoService {
	return &GeoService{
		geocoder: geocoder,
		cache:    cache,
	}
}

func (s *GeoService) Geocode(ctx context.Context, address string) (*models.Location, error) {
	if cached, found := s.cache.Get(address); found {
		return cached, nil
	}

	location, err := s.geocoder.Geocode(address)
	if err != nil {
		return nil, fmt.Errorf("geocoding failed: %w", err)
	}

	s.cache.Set(address, location, 30*24*60*60) // 30 дней в секундах

	return location, nil
}

func (s *GeoService) ReverseGeocode(ctx context.Context, lat float64, lon float64) (*models.Location, error) {
	if cached, found := s.cache.Get(fmt.Sprintf("lat=%f, lon=%f", lat, lon)); found {
		return cached, nil
	}

	location, err := s.geocoder.ReverseGeocode(lat, lon)
	if err != nil {
		return nil, fmt.Errorf("reverse geocoding failed: %w", err)
	}

	s.cache.Set(fmt.Sprintf("lat=%f, lon=%f", lat, lon), location, 30*24*60*60) // 30 дней в секундах

	return location, nil
}

func (s *GeoService) BulkGeocode(ctx context.Context, addresses []string) ([]*models.Location, error) {
	// TODO
	return nil, nil

	// var results []*models.Location

	// for _, address := range addresses {
	// 	location, err := s.Geocode(ctx, address)
	// 	if err != nil {
	// 		// пропускать или падать?
	// 		continue
	// 	}
	// 	results = append(results, location)
	// }

	// return results, nil
}
