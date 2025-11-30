package events

import (
	"time"
)

// картинки пока не отправляем

type PinCreated struct {
	BaseEvent
	PinID            string    `json:"pin_id"`
	Name             string    `json:"name"`
	OwnerID          string    `json:"owner_id"`
	Description      string    `json:"description"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	Address          string    `json:"address,omitempty"`
	Rating           float64   `json:"rating"`
	CreatedAt        time.Time `json:"created_at"`
	AccessLevel      string    `json:"access_level"` // подтягивается из подборки, для которой создается
	PlaceID          string    `json:"place_id"`
	GisID            string    `json:"gis_id"`
	PlaceName        string    `json:"place_name"`
	PlaceLatitude    float64   `json:"place_latitude"`
	PlaceLongitude   float64   `json:"place_longitude"`
	PlaceAddress     string    `json:"place_address,omitempty"`
	PlacePurposeName string    `json:"place_purpose_name"`
	PlaceType        string    `json:"place_type"`
}

type PinUpdated struct {
	BaseEvent
	PinID            string  `json:"pin_id"`
	Name             string  `json:"name,omitempty"`
	Description      string  `json:"description,omitempty"`
	Latitude         float64 `json:"latitude,omitempty"`
	Longitude        float64 `json:"longitude,omitempty"`
	Address          string  `json:"address,omitempty"`
	Rating           float64 `json:"rating,omitempty"`
	AccessLevel      string  `json:"access_level,omitempty"`
	PlaceID          string  `json:"place_id"`
	GisID            string  `json:"gis_id,omitempty"`
	PlaceName        string  `json:"place_name,omitempty"`
	PlaceLatitude    float64 `json:"place_latitude,omitempty"`
	PlaceLongitude   float64 `json:"place_longitude,omitempty"`
	PlaceAddress     string  `json:"place_address,omitempty"`
	PlacePurposeName string  `json:"place_purpose_name,omitempty"`
	PlaceType        string  `json:"place_type,omitempty"`
}

type PinCommentCountChanged struct {
	BaseEvent
	PinID string `json:"pin_id"`
	Delta int    `json:"delta"` // +1 или -1 (добавили или удалили комментарий)
}

type PinReactionCountChanged struct {
	BaseEvent
	PinID string `json:"pin_id"`
	// TODO: ReactionType string `json:"reaction_type"` в дальнейшем хотелось бы различать позитивные и отрицательные реакции
	Delta int `json:"delta"` // +1 или -1 (добавили или удалили реакцию)
}

type PinBookmarkCountChanged struct {
	BaseEvent
	PinID string `json:"pin_id"`
	Delta int    `json:"delta"` // +1 или -1 (добавили или удалили сохранение в закладки)
}
