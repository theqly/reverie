package mapper

import (
	"content-service/internal/dto"
	"content-service/internal/model"

	"github.com/google/uuid"
)

func ToBoardModel(req dto.BoardRequest) model.Board {
	return model.Board{
		ID:           uuid.New(),
		Title:        req.Title,
		OwnerID:      req.OwnerID,
		Visibility:   req.Visibility,
		GroupEditors: req.GroupEditors,
	}
}

func ToBoardResponse(board model.Board) dto.BoardResponse {
	return dto.BoardResponse{
		ID:           board.ID,
		Title:        board.Title,
		OwnerID:      board.OwnerID,
		Visibility:   board.Visibility,
		GroupEditors: board.GroupEditors,
	}
}
