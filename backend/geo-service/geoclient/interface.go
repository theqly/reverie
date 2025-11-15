package geoclient

import "context"

type GeocodeResult struct {
	PlaceId     int64   `json:"place_id"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	DisplayName string  `json:"display_name"`
	Address     Address `json:"address"`
}

type ReverseGeocodeResult struct {
	PlaceId     int64   `json:"place_id"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	DisplayName string  `json:"display_name"`
	Address     Address `json:"address"`
}

type Address struct {
	Country     string `json:"country"`
	City        string `json:"city"`
	Street      string `json:"street"`
	HouseNumber string `json:"house_number"`
	Postcode    string `json:"postcode"`
}

type GeoClient interface {
	Geocode(ctx context.Context, address string) (*GeocodeResult, error)
	ReverseGeocode(ctx context.Context, lat float64, lon float64) (*ReverseGeocodeResult, error)
	// TODO
	// BulkGeocode(ctx context.Context, addresses []string) ([]*GeocodeResult, error)
	Close() error
}
