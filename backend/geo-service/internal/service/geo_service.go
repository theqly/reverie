package service

import (
	"context"
	"fmt"
	"geo-service/internal/logger"
	"geo-service/internal/models"

	"go.uber.org/zap"
)

type GeoService struct {
	geocoder models.Geocoder
	cache    models.Cache
	log      *zap.Logger
}

func NewGeoService(geocoder models.Geocoder, cache models.Cache) *GeoService {
	return &GeoService{
		geocoder: geocoder,
		cache:    cache,
		log:      logger.Log.With(zap.String("component", "geo_service")),
	}
}

func (s *GeoService) Geocode(ctx context.Context, address string) (*models.Location, error) {
	s.log.Info("Processing geocode request", zap.String("address", address))

	if cached, found := s.cache.Get(address); found {
		s.log.Debug("Cache hit", zap.String("address", address))
		return cached, nil
	}

	s.log.Debug("Cache miss", zap.String("address", address))

	location, err := s.geocoder.Geocode(address)
	if err != nil {
		s.log.Error("Geocoding failed",
			zap.String("address", address),
			zap.Error(err),
		)
		return nil, fmt.Errorf("geocoding failed: %w", err)
	}

	s.cache.Set(address, location, 30*24*60*60) // 30 дней в секундах
	s.log.Info("Successfully processed geocode request",
		zap.String("address", address),
		zap.Float64("lat", location.Lat),
		zap.Float64("lon", location.Lon),
	)

	return location, nil
}

func (s *GeoService) ReverseGeocode(ctx context.Context, lat float64, lon float64) (*models.Location, error) {
	s.log.Info("Processing reverse geocode request",
		zap.Float64("lat", lat),
		zap.Float64("lon", lon),
	)

	if cached, found := s.cache.Get(fmt.Sprintf("lat=%f, lon=%f", lat, lon)); found {
		s.log.Debug("Cache hit",
			zap.Float64("lat", lat),
			zap.Float64("lon", lon),
		)
		return cached, nil
	}

	s.log.Debug("Cache miss",
		zap.Float64("lat", lat),
		zap.Float64("lon", lon),
	)

	location, err := s.geocoder.ReverseGeocode(lat, lon)
	if err != nil {
		s.log.Error("Reverse geocoding failed",
			zap.Float64("lat", lat),
			zap.Float64("lon", lon),
			zap.Error(err),
		)
		return nil, fmt.Errorf("reverse geocoding failed: %w", err)
	}

	s.cache.Set(fmt.Sprintf("lat=%f, lon=%f", lat, lon), location, 30*24*60*60) // 30 дней в секундах
	s.log.Info("Successfully processed reverse geocode request",
		zap.String("country", location.Address.Country),
		zap.String("city", location.Address.City),
		zap.String("street", location.Address.Street),
		zap.String("house_number", location.Address.HouseNumber),
		zap.String("postcode", location.Address.Postcode),
		zap.Float64("lat", location.Lat),
		zap.Float64("lon", location.Lon),
	)

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
