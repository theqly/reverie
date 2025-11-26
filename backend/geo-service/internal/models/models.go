package models

type Location struct {
	PlaceId     string  `json:"place_id"`
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

type Geocoder interface {
	Geocode(address string) (*Location, error)
	ReverseGeocode(lat, lon float64) (*Location, error)
	// TODO
	// BilkGeocode(address []string) (*Location, error)
}

type Cache interface {
	Get(key string) (*Location, bool)
	Set(key string, value *Location, ttl int)
}
