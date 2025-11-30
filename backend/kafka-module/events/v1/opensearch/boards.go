package opensearch_events

import (
	"time"

	"github.com/theqly/reverie/backend/kafka-module/events/v1/base"
)

type BoardCreatedEvent struct {
	base.BaseEvent
	BoardID     string    `json:"board_id"`
	Name        string    `json:"name"`
	AccessLevel string    `json:"access_level"`
	OwnerID     string    `json:"owner_id"`
	OwnerType   string    `json:"owner_type"`
	CreatedAt   time.Time `json:"created_at"`
	PinIDs      []string  `json:"pin_ids,omitempty"`
}

type BoardUpdated struct {
	base.BaseEvent
	BoardID     string `json:"board_id"`
	Name        string `json:"name,omitempty"`
	AccessLevel string `json:"access_level,omitempty"`
}

type BoardPinsAdded struct {
	base.BaseEvent
	BoardID string   `json:"board_id"`
	PinIDs  []string `json:"pin_ids"`
}

type BoardPinsRemoved struct {
	base.BaseEvent
	BoardID string   `json:"board_id"`
	PinIDs  []string `json:"pin_ids"`
}

type BoardCommentCountChanged struct {
	base.BaseEvent
	BoardID string `json:"board_id"`
	Delta   int    `json:"delta"` // +1 или -1 (добавили или удалили комментарий)
}

type BoardReactionCountChanged struct {
	base.BaseEvent
	BoardID string `json:"board_id"`
	// TODO: ReactionType string `json:"reaction_type"` в дальнейшем хотелось бы различать позитивные и отрицательные реакции
	Delta int `json:"delta"` // +1 или -1 (добавили или удалили реакцию)
}

type BoardBookmarkCountChanged struct {
	base.BaseEvent
	BoardID string `json:"board_id"`
	Delta   int    `json:"delta"` // +1 или -1 (добавили или удалили сохранение в закладки)
}
