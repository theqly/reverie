package service

import (
	"content-service/internal/models"
	"content-service/internal/repository"
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type BoardService struct {
	boardRepo *repository.BoardRepository
}

func NewBoardService(boardRepo *repository.BoardRepository) *BoardService {
	return &BoardService{boardRepo: boardRepo}
}

func (s *BoardService) CreateBoard(ctx context.Context, board *models.Board) (*models.Board, error) {
	board.ID = uuid.New()
	board.CreatedAt = time.Now()
	if err := s.boardRepo.Create(ctx, *board); err != nil {
		return nil, err
	}
	return board, nil
}

func (s *BoardService) GetBoard(ctx context.Context, id uuid.UUID) (*models.Board, error) {
	board, err := s.boardRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &board, nil
}

func (s *BoardService) UpdateBoard(ctx context.Context, id uuid.UUID, update models.Board) error {
	existing, err := s.boardRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing.OwnerID != update.OwnerID {
		return errors.New("cannot change board owner")
	}
	return s.boardRepo.Update(ctx, id, update)
}
