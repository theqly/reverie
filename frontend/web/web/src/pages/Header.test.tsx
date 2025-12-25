import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import Header from './Header';

// Мокируем useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('рендерится с логотипом и поиском', () => {
    render(<Header />);
    
    expect(screen.getByAltText('Reverie')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Поиск...')).toBeInTheDocument();
  });

  it('навигация на /feed при клике на логотип', () => {
    render(<Header />);
    
    const logoButton = screen.getByLabelText('На главную');
    fireEvent.click(logoButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/feed');
  });

  it('навигация на /profile при клике на кнопку профиля', () => {
    render(<Header />);
    
    const profileBtn = screen.getByRole('button', { name: '' });
    const buttons = screen.getAllByRole('button');
    const profileButton = buttons[1]; // Вторая кнопка - это профиль
    
    fireEvent.click(profileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('можно вводить текст в поле поиска', () => {
    render(<Header />);
    
    const searchInput = screen.getByPlaceholderText('Поиск...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'тестовый поиск' } });
    
    expect(searchInput.value).toBe('тестовый поиск');
  });

  it('выводит в консоль при нажатии Enter в поиске', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<Header />);
    
    const searchInput = screen.getByPlaceholderText('Поиск...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    expect(consoleSpy).toHaveBeenCalledWith('Поиск:', 'test query');
    consoleSpy.mockRestore();
  });
});
