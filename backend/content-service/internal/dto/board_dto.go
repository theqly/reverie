package dto

import "github.com/google/uuid"

type BoardRequest struct {
	Title        string      `json:"title"`
	OwnerID      uuid.UUID   `json:"owner_id"`
	Visibility   string      `json:"visibility"`
	GroupEditors []uuid.UUID `json:"group_editors"`
}

type BoardResponse struct {
	ID           uuid.UUID   `json:"id"`
	Title        string      `json:"title"`
	OwnerID      uuid.UUID   `json:"owner_id"`
	Visibility   string      `json:"visibility"`
	GroupEditors []uuid.UUID `json:"group_editors"`
}
