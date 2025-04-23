package service

import (
	"content-service/graph/model"
	"content-service/internal/mapper"
	"content-service/internal/models"
	"content-service/internal/repository"
	"context"
	"time"

	"github.com/google/uuid"
)

type BoardService struct {
	boardRepo *repository.BoardRepository
}

func NewBoardService(boardRepo *repository.BoardRepository) *BoardService {
	return &BoardService{boardRepo: boardRepo}
}

func (s *BoardService) CreateBoard(ctx context.Context, createBoardInput *model.CreateBoardInput) (*models.Board, error) {
	board := mapper.CreateToDomainBoard(createBoardInput)
	board.ID = uuid.New()
	board.CreatedAt = time.Now()

	if err := s.boardRepo.Create(ctx, *board); err != nil {
		return nil, err
	}
	return board, nil
}

func (s *BoardService) Board(ctx context.Context, id uuid.UUID) (*model.Board, error) {
	board, err := s.boardRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return mapper.ToGraphQLBoard(&board), nil
}

func (s *BoardService) UpdateBoard(ctx context.Context, id uuid.UUID, input model.UpdateBoardInput) (*model.Board, error) {
	board := mapper.UpdateToDomainBoard(&input)

	//тут нужно проверку вставить для прав пользователя

	err := s.boardRepo.Update(ctx, id, *board)
	if err != nil {
		return nil, err
	}

	return s.Board(ctx, id)
}
