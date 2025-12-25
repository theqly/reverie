import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import PinGridItem from './PinGridItem';

describe('PinGridItem', () => {
  const mockPin = {
    id: '123',
    image: 'https://example.com/image.jpg',
    title: 'Тестовый пин',
    location: 'Москва, Россия',
    author: 'test_user',
    authorAvatar: 'https://example.com/avatar.jpg'
  };

  it('рендерит пин с корректными данными', () => {
    render(<PinGridItem pin={mockPin} onClick={vi.fn()} />);
    
    expect(screen.getByText('Тестовый пин')).toBeInTheDocument();
    expect(screen.getByText('Москва, Россия')).toBeInTheDocument();
    expect(screen.getByText('test_user')).toBeInTheDocument();
  });

  it('отображает изображение пина', () => {
    render(<PinGridItem pin={mockPin} onClick={vi.fn()} />);
    
    const image = screen.getByAltText('Тестовый пин') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toBe('https://example.com/image.jpg');
  });

  it('отображает аватар автора', () => {
    render(<PinGridItem pin={mockPin} onClick={vi.fn()} />);
    
    const avatar = screen.getByAltText('Аватар test_user') as HTMLImageElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar.src).toBe('https://example.com/avatar.jpg');
  });

  it('вызывает onClick с правильным id при клике', () => {
    const mockOnClick = vi.fn();
    render(<PinGridItem pin={mockPin} onClick={mockOnClick} />);
    
    const pinElement = screen.getByText('Тестовый пин').closest('div');
    if (pinElement?.parentElement) {
      fireEvent.click(pinElement.parentElement);
    }
    
    expect(mockOnClick).toHaveBeenCalledWith('123');
  });

  it('использует дефолтные значения если location не указан', () => {
    const pinWithoutLocation = { ...mockPin, location: undefined };
    render(<PinGridItem pin={pinWithoutLocation} onClick={vi.fn()} />);
    
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('использует дефолтные значения если author не указан', () => {
    const pinWithoutAuthor = { ...mockPin, author: undefined };
    render(<PinGridItem pin={pinWithoutAuthor} onClick={vi.fn()} />);
    
    expect(screen.getByText('jane_anderson')).toBeInTheDocument();
  });

  it('не падает если onClick не передан', () => {
    render(<PinGridItem pin={mockPin} />);
    
    const pinElement = screen.getByText('Тестовый пин').closest('div');
    expect(() => {
      if (pinElement?.parentElement) {
        fireEvent.click(pinElement.parentElement);
      }
    }).not.toThrow();
  });
});
