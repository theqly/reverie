import { describe, it, expect } from 'vitest';
import {
  formatDate,
  isValidEmail,
  truncateText,
  formatCoordinates,
  getInitials
} from './helpers';

describe('formatDate', () => {
  it('форматирует Date объект в DD.MM.YYYY', () => {
    const date = new Date('2025-12-19');
    expect(formatDate(date)).toBe('19.12.2025');
  });

  it('форматирует строку даты в DD.MM.YYYY', () => {
    expect(formatDate('2025-01-05')).toBe('05.01.2025');
  });

  it('возвращает "Invalid date" для невалидной даты', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });
});

describe('isValidEmail', () => {
  it('возвращает true для валидного email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('возвращает false для невалидного email', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('truncateText', () => {
  it('обрезает длинный текст и добавляет ...', () => {
    const text = 'Это очень длинный текст';
    expect(truncateText(text, 10)).toBe('Это очень ...');
  });

  it('не обрезает короткий текст', () => {
    const text = 'Короткий';
    expect(truncateText(text, 20)).toBe('Короткий');
  });

  it('возвращает текст как есть, если длина равна maxLength', () => {
    const text = 'Exactly10!';
    expect(truncateText(text, 10)).toBe('Exactly10!');
  });
});

describe('formatCoordinates', () => {
  it('форматирует координаты с 4 знаками после запятой', () => {
    expect(formatCoordinates(55.7558, 37.6173)).toBe('55.7558, 37.6173');
  });

  it('округляет координаты до 4 знаков', () => {
    expect(formatCoordinates(55.755855555, 37.617388888)).toBe('55.7559, 37.6174');
  });

  it('работает с отрицательными координатами', () => {
    expect(formatCoordinates(-33.8688, 151.2093)).toBe('-33.8688, 151.2093');
  });
});

describe('getInitials', () => {
  it('возвращает инициалы для полного имени', () => {
    expect(getInitials('Иван Иванов')).toBe('ИИ');
  });

  it('возвращает одну букву для одного слова', () => {
    expect(getInitials('Иван')).toBe('И');
  });

  it('возвращает первую и последнюю букву для имени из 3+ слов', () => {
    expect(getInitials('Иван Петрович Сидоров')).toBe('ИС');
  });

  it('возвращает пустую строку для пустого имени', () => {
    expect(getInitials('')).toBe('');
  });

  it('обрабатывает пробелы в начале и конце', () => {
    expect(getInitials('  Иван Иванов  ')).toBe('ИИ');
  });
});
