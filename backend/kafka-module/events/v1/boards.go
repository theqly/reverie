package events

import (
	"time"
)

type BoardCreated struct {
	BaseEvent
	BoardID        string    `json:"board_id"`
	Name           string    `json:"name"`
	AccessLevel    string    `json:"access_level"`
	OwnerID        string    `json:"owner_id"`
	OwnerType      string    `json:"owner_type"`
	AuthorID       string    `json:"author_id"`
	CreatedAt      time.Time `json:"created_at"`
	SavedAt        time.Time `json:"saved_at"`
	PinIDs         []string  `json:"pin_ids,omitempty"`
	GroupMemberIDs []string  `json:"group_member_ids,omitempty"`
}

type BoardUpdated struct {
	BaseEvent
	BoardID     string `json:"board_id"`
	Name        string `json:"name,omitempty"`
	AccessLevel string `json:"access_level,omitempty"`
}

type BoardDeleted struct {
	BaseEvent
	BoardID string `json:"board_id"`
}

type BoardPinsAdded struct {
	BaseEvent
	BoardID string   `json:"board_id"`
	PinIDs  []string `json:"pin_ids"`
}

type BoardPinsDeleted struct {
	BaseEvent
	BoardID string   `json:"board_id"`
	PinIDs  []string `json:"pin_ids"`
}

// опенсерч должен только количество менять
type BoardCommented struct {
	BaseEvent
	BoardID   string    `json:"board_id"`
	CommentID string    `json:"comment_id"`
	OwnerID   string    `json:"owner_id"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// опенсерч должен только количество менять
type BoardCommentUpdated struct {
	BaseEvent
	CommentID string `json:"comment_id"`
	Message   string `json:"message"`
}

// опенсерч должен только количество менять
type BoardCommentDeleted struct {
	BaseEvent
	BoardID   string `json:"board_id"`
	CommentID string `json:"comment_id"`
}

// опенсерч должен только количество менять
type BoardReactionAdded struct {
	BaseEvent
	BoardID    string `json:"board_id"`
	ReactionID string `json:"reaction_id"`
	OwnerID    string `json:"owner_id"`
}

// опенсерч должен только количество менять
type BoardReactionDeleted struct {
	BaseEvent
	BoardID    string `json:"board_id"`
	ReactionID string `json:"reaction_id"`
	OwnerID    string `json:"owner_id"`
}

// опенсерч должен только количество менять
type BoardBookmarkAdded struct {
	BaseEvent
	BoardID string `json:"board_id"`
	OwnerID string `json:"owner_id"`
}

// опенсерч должен только количество менять
type BoardBookmarkDeleted struct {
	BaseEvent
	BoardID string `json:"board_id"`
	OwnerID string `json:"owner_id"`
}

type BoardGroupMembersAdded struct {
	BaseEvent
	BoardID        string   `json:"board_id"`
	GroupMemberIDs []string `json:"group_member_ids"`
}

type BoardGroupMembersDeleted struct {
	BaseEvent
	BoardID        string   `json:"board_id"`
	GroupMemberIDs []string `json:"group_member_ids"`
}
