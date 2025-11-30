package base

import "time"

type BaseEvent struct {
	EventType  string    `json:"event_type"`
	EventID    string    `json:"event_id"`
	OccurredAt time.Time `json:"occurred_at"`
}
