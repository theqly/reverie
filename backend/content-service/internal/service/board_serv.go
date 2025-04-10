package service

import (
	"content-service/internal/model"
	"content-service/internal/repository"
	"context"

	"github.com/google/uuid"
)

type BoardService struct {
	boardRepo *repository.BoardRepository
}

func NewBoardService(boardRepo *repository.BoardRepository) *BoardService {
	return &BoardService{boardRepo: boardRepo}
}

func (s *BoardService) CreateBoard(ctx context.Context, board model.Board) error {
	return s.boardRepo.Create(ctx, board)
}

func (s *BoardService) GetBoard(ctx context.Context, id uuid.UUID) (model.Board, error) {
	return s.boardRepo.GetByID(ctx, id)
}
