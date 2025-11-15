package handler

import (
	"context"
	"geo-service/internal/service"
	"geo-service/pkg/geopb"
)

type GeoHandler struct {
	geopb.UnimplementedGeoServiceServer
	service *service.GeoService
}

func NewGeoHandler(geoService *service.GeoService) *GeoHandler {
	return &GeoHandler{
		service: geoService,
	}
}

func (h *GeoHandler) Geocode(ctx context.Context, req *geopb.GeocodeRequest) (*geopb.GeocodeResponse, error) {
	location, err := h.service.Geocode(ctx, req.Address)
	if err != nil {
		return nil, err
	}

	return &geopb.GeocodeResponse{
		PlaceId:     location.PlaceId,
		Lat:         location.Lat,
		Lon:         location.Lon,
		DisplayName: location.DisplayName,
		Address: &geopb.Address{
			Country:     location.Address.Country,
			City:        location.Address.City,
			Street:      location.Address.Street,
			HouseNumber: location.Address.HouseNumber,
			Postcode:    location.Address.Postcode,
		},
	}, nil
}

func (h *GeoHandler) ReverseGeocode(ctx context.Context, req *geopb.ReverseGeocodeRequest) (*geopb.ReverseGeocodeResponse, error) {
	location, err := h.service.ReverseGeocode(ctx, req.Lat, req.Lon)
	if err != nil {
		return nil, err
	}

	return &geopb.ReverseGeocodeResponse{
		PlaceId:     location.PlaceId,
		Lat:         location.Lat,
		Lon:         location.Lon,
		DisplayName: location.DisplayName,
		Address: &geopb.Address{
			Country:     location.Address.Country,
			City:        location.Address.City,
			Street:      location.Address.Street,
			HouseNumber: location.Address.HouseNumber,
			Postcode:    location.Address.Postcode,
		},
	}, nil
}

func (h *GeoHandler) BulkGeocode(ctx context.Context, req *geopb.BulkGeocodeRequest) (*geopb.BulkGeocodeResponse, error) {
	// TODO
	return nil, nil

	// locations, err := h.service.BulkGeocode(ctx, req.Addresses)
	// if err != nil {
	// 	return nil, err
	// }

	// var responses []*geopb.GeocodeResponse
	// for _, loc := range locations {
	// 	responses = append(responses, &geopb.GeocodeResponse{
	// 		PlaceId:     loc.PlaceId,
	// 		Lat:         loc.Lat,
	// 		Lon:         loc.Lon,
	// 		DisplayName: loc.DisplayName,
	// 		Address: &geopb.Address{
	// 			Country:     loc.Address.Country,
	// 			City:        loc.Address.City,
	// 			Street:      loc.Address.Street,
	// 			HouseNumber: loc.Address.HouseNumber,
	// 			Postcode:    loc.Address.Postcode,
	// 		},
	// 	})
	// }

	// return &geopb.BulkGeocodeResponse{Results: responses}, nil
}
