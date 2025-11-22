package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"geo-service/internal/models"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"geo-service/internal/logger"

	"go.uber.org/zap"
	"golang.org/x/time/rate"
)

type NominatimRepo struct {
	baseURL string
	client  *http.Client
	limiter *rate.Limiter
	log     *zap.Logger
}

func NewNominatimRepo() *NominatimRepo {
	return &NominatimRepo{
		baseURL: "https://nominatim.openstreetmap.org",
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		limiter: rate.NewLimiter(rate.Every(time.Second), 1), // 1 запрос в секунду
		log:     logger.Log.With(zap.String("component", "nominatim_repo")),
	}
}

func (r *NominatimRepo) Geocode(address string) (*models.Location, error) {
	r.log.Info("Geocoding address", zap.String("address", address))

	// Соблюдаем лимит (ограничение сервиса внешнего)
	ctx := context.Background()
	if err := r.limiter.Wait(ctx); err != nil {
		r.log.Error("Rate limit wait failed", zap.Error(err))
		return nil, fmt.Errorf("rate limit exceeded: %w", err)
	}

	r.log.Debug("Making request to Nominatim API")

	params := url.Values{}
	params.Add("q", address)
	params.Add("format", "json")
	params.Add("addressdetails", "1")
	params.Add("limit", "1")

	req, err := http.NewRequest("GET", r.baseURL+"/search?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}

	// Важно: указываем User-Agent (ограничение сервиса внешнего)
	req.Header.Set("User-Agent", "GeoService/1.0 (Reverie.com)")

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var results []struct {
		PlaceId     int64  `json:"place_id"`
		Lat         string `json:"lat"`
		Lon         string `json:"lon"`
		DisplayName string `json:"display_name"`
		Address     struct {
			Country     string `json:"country"`
			City        string `json:"city"`
			Street      string `json:"road"`
			HouseNumber string `json:"house_number"`
			Postcode    string `json:"postcode"`
		} `json:"address"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		r.log.Warn("Address not found", zap.String("address", address))
		return nil, fmt.Errorf("address not found: %s", address)
	}

	result := results[0]
	lat, _ := strconv.ParseFloat(result.Lat, 64)
	lon, _ := strconv.ParseFloat(result.Lon, 64)

	r.log.Info("Successfully geocoded address",
		zap.String("address", address),
		zap.Float64("lat", lat),
		zap.Float64("lon", lon),
	)

	return &models.Location{
		PlaceId:     strconv.FormatInt(result.PlaceId, 10),
		Lat:         lat,
		Lon:         lon,
		DisplayName: result.DisplayName,
		Address: models.Address{
			Country:     result.Address.Country,
			City:        result.Address.City,
			Street:      result.Address.Street,
			HouseNumber: result.Address.HouseNumber,
			Postcode:    result.Address.Postcode,
		},
	}, nil
}

func (r *NominatimRepo) ReverseGeocode(lat float64, lon float64) (*models.Location, error) {
	r.log.Info("Reverse geocoding point",
		zap.Float64("lat", lat),
		zap.Float64("lon", lon),
	)

	// Соблюдаем лимит (ограничение сервиса внешнего)
	ctx := context.Background()
	if err := r.limiter.Wait(ctx); err != nil {
		r.log.Error("Rate limit wait failed", zap.Error(err))
		return nil, fmt.Errorf("rate limit exceeded: %w", err)
	}

	r.log.Debug("Making request to Nominatim API")

	params := url.Values{}
	params.Add("lat", fmt.Sprintf("%f", lat))
	params.Add("lon", fmt.Sprintf("%f", lon))
	params.Add("format", "json")
	params.Add("addressdetails", "1")
	params.Add("zoom", "18")

	req, err := http.NewRequest("GET", r.baseURL+"/reverse?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}

	// Важно: указываем User-Agent (ограничение сервиса внешнего)
	req.Header.Set("User-Agent", "GeoService/1.0 (Reverie.com)")

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		PlaceId     int64  `json:"place_id"`
		Lat         string `json:"lat"`
		Lon         string `json:"lon"`
		DisplayName string `json:"display_name"`
		Address     struct {
			Country     string `json:"country"`
			City        string `json:"city"`
			Street      string `json:"road"`
			HouseNumber string `json:"house_number"`
			Postcode    string `json:"postcode"`
		} `json:"address"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	res_lat, _ := strconv.ParseFloat(result.Lat, 64)
	res_lon, _ := strconv.ParseFloat(result.Lon, 64)

	r.log.Info("Successfully reverse geocoded point",
		zap.String("country", result.Address.Country),
		zap.String("city", result.Address.City),
		zap.String("street", result.Address.Street),
		zap.String("house_number", result.Address.HouseNumber),
		zap.String("postcode", result.Address.Postcode),
		zap.Float64("lat", lat),
		zap.Float64("lon", lon),
	)

	return &models.Location{
		PlaceId:     strconv.FormatInt(result.PlaceId, 10),
		Lat:         res_lat,
		Lon:         res_lon,
		DisplayName: result.DisplayName,
		Address: models.Address{
			Country:     result.Address.Country,
			City:        result.Address.City,
			Street:      result.Address.Street,
			HouseNumber: result.Address.HouseNumber,
			Postcode:    result.Address.Postcode,
		},
	}, nil
}

func (r *NominatimRepo) BulkGeocode(address []string) (*models.Location, error) {
	// TODO
	return nil, nil
}
