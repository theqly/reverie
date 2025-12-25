import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { BoardAccessChecker } from './BoardAccessChecker';
import * as boardApi from '../../api/board';

// Мокируем API вызовы
vi.mock('../../api/board', () => ({
  fetchBoardBasic: vi.fn(),
  fetchFullBoard: vi.fn(),
  checkUserInGroup: vi.fn(),
}));

describe('BoardAccessChecker', () => {
  it('показывает "Загрузка..." при первичной загрузке', () => {
    vi.mocked(boardApi.fetchBoardBasic).mockImplementation(() => 
      new Promise(() => {}) // никогда не резолвится
    );

    render(
      <BoardAccessChecker 
        boardId="test-board-id" 
        currentUserId="test-user-id" 
      />
    );

    expect(screen.getByText(/Загрузка\.\.\./i)).toBeInTheDocument();
  });

  it('показывает ошибку если доска не найдена', async () => {
    vi.mocked(boardApi.fetchBoardBasic).mockResolvedValue(null);

    render(
      <BoardAccessChecker 
        boardId="test-board-id" 
        currentUserId="test-user-id" 
      />
    );

    expect(await screen.findByText(/Нет доступа к этой доске/i)).toBeInTheDocument();
  });

  it('показывает сообщение об отсутствии доступа для приватной доски другого пользователя', async () => {
    const mockBoard = {
      id: 'test-board-id',
      accessLevel: { type: 'private' },
      owner: { id: 'other-user-id' },
      groupId: null,
    };

    vi.mocked(boardApi.fetchBoardBasic).mockResolvedValue(mockBoard as any);

    render(
      <BoardAccessChecker 
        boardId="test-board-id" 
        currentUserId="test-user-id" 
      />
    );

    expect(await screen.findByText(/У вас нет доступа к этой подборке/i)).toBeInTheDocument();
  });
});
