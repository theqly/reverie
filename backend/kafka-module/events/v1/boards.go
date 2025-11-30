package events

import (
	"time"
)

type BoardCreated struct {
	BaseEvent
	BoardID     string    `json:"board_id"`
	Name        string    `json:"name"`
	AccessLevel string    `json:"access_level"`
	OwnerID     string    `json:"owner_id"`
	OwnerType   string    `json:"owner_type"`
	CreatedAt   time.Time `json:"created_at"`
	PinIDs      []string  `json:"pin_ids,omitempty"`
}

type BoardUpdated struct {
	BaseEvent
	BoardID     string `json:"board_id"`
	Name        string `json:"name,omitempty"`
	AccessLevel string `json:"access_level,omitempty"`
}

type BoardPinsAdded struct {
	BaseEvent
	BoardID string   `json:"board_id"`
	PinIDs  []string `json:"pin_ids"`
}

type BoardPinsRemoved struct {
	BaseEvent
	BoardID string   `json:"board_id"`
	PinIDs  []string `json:"pin_ids"`
}

type BoardCommentCountChanged struct {
	BaseEvent
	BoardID string `json:"board_id"`
	Delta   int    `json:"delta"` // +1 или -1 (добавили или удалили комментарий)
}

type BoardReactionCountChanged struct {
	BaseEvent
	BoardID string `json:"board_id"`
	// TODO: ReactionType string `json:"reaction_type"` в дальнейшем хотелось бы различать позитивные и отрицательные реакции
	Delta int `json:"delta"` // +1 или -1 (добавили или удалили реакцию)
}

type BoardBookmarkCountChanged struct {
	BaseEvent
	BoardID string `json:"board_id"`
	Delta   int    `json:"delta"` // +1 или -1 (добавили или удалили сохранение в закладки)
}
