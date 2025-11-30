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

type PinDeleted struct {
	BaseEvent
	PinID string `json:"pin_id"`
}

// опенсерч должен только количество менять
type PinCommented struct {
	BaseEvent
	PinID     string    `json:"pin_id"`
	CommentID string    `json:"comment_id"`
	OwnerID   string    `json:"owner_id"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// опенсерч должен только количество менять
type PinCommentUpdated struct {
	BaseEvent
	CommentID string `json:"comment_id"`
	Message   string `json:"message"`
}

// опенсерч должен только количество менять
type PinCommentDeleted struct {
	BaseEvent
	CommentID string `json:"comment_id"`
}

// опенсерч должен только количество менять
type PinReactionAdded struct {
	BaseEvent
	PinID      string `json:"pin_id"`
	ReactionID string `json:"reaction_id"`
	OwnerID    string `json:"owner_id"`
}

// опенсерч должен только количество менять
type PinReactionDeleted struct {
	BaseEvent
	PinID      string `json:"pin_id"`
	ReactionID string `json:"reaction_id"`
	OwnerID    string `json:"owner_id"`
}

// опенсерч должен только количество менять
type PinBookmarkAdded struct {
	BaseEvent
	PinID   string `json:"pin_id"`
	OwnerID string `json:"owner_id"`
}

// опенсерч должен только количество менять
type PinBookmarkDeleted struct {
	BaseEvent
	PinID   string `json:"pin_id"`
	OwnerID string `json:"owner_id"`
}
