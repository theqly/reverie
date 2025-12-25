import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildQueryString,
  parseQueryString,
  isValidCoordinates,
  calculateDistance,
  formatDistance,
  createSlug,
  capitalize,
  isEmptyObject,
  debounce
} from './common';

describe('buildQueryString', () => {
  it('создает query string из объекта', () => {
    const params = { name: 'test', page: 1, active: true };
    expect(buildQueryString(params)).toBe('name=test&page=1&active=true');
  });

  it('обрабатывает пустой объект', () => {
    expect(buildQueryString({})).toBe('');
  });

  it('экранирует специальные символы', () => {
    const params = { query: 'hello world', special: 'a&b=c' };
    const result = buildQueryString(params);
    expect(result).toContain('hello+world');
  });
});

describe('parseQueryString', () => {
  it('парсит query string в объект', () => {
    const result = parseQueryString('name=test&page=1&active=true');
    expect(result).toEqual({ name: 'test', page: '1', active: 'true' });
  });

  it('обрабатывает пустую строку', () => {
    expect(parseQueryString('')).toEqual({});
  });

  it('декодирует URL-кодированные значения', () => {
    const result = parseQueryString('query=hello+world');
    expect(result.query).toBe('hello world');
  });
});

describe('isValidCoordinates', () => {
  it('возвращает true для валидных координат', () => {
    expect(isValidCoordinates(55.7558, 37.6173)).toBe(true);
    expect(isValidCoordinates(0, 0)).toBe(true);
    expect(isValidCoordinates(-90, -180)).toBe(true);
    expect(isValidCoordinates(90, 180)).toBe(true);
  });

  it('возвращает false для невалидных координат', () => {
    expect(isValidCoordinates(91, 0)).toBe(false);
    expect(isValidCoordinates(-91, 0)).toBe(false);
    expect(isValidCoordinates(0, 181)).toBe(false);
    expect(isValidCoordinates(0, -181)).toBe(false);
  });
});

describe('calculateDistance', () => {
  it('вычисляет расстояние между Москвой и Санкт-Петербургом', () => {
    // Москва: 55.7558, 37.6173
    // Санкт-Петербург: 59.9343, 30.3351
    const distance = calculateDistance(55.7558, 37.6173, 59.9343, 30.3351);
    // Примерное расстояние ~635 км
    expect(distance).toBeGreaterThan(630);
    expect(distance).toBeLessThan(640);
  });

  it('возвращает 0 для одинаковых координат', () => {
    const distance = calculateDistance(55.7558, 37.6173, 55.7558, 37.6173);
    expect(distance).toBeCloseTo(0, 5);
  });

  it('работает с отрицательными координатами', () => {
    const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
    expect(distance).toBeGreaterThan(0);
  });
});

describe('formatDistance', () => {
  it('форматирует расстояние меньше 1 км в метрах', () => {
    expect(formatDistance(0.5)).toBe('500 м');
    expect(formatDistance(0.123)).toBe('123 м');
  });

  it('форматирует расстояние от 1 до 10 км с одним знаком', () => {
    expect(formatDistance(5.678)).toBe('5.7 км');
    expect(formatDistance(1.234)).toBe('1.2 км');
  });

  it('форматирует расстояние больше 10 км целым числом', () => {
    expect(formatDistance(15.678)).toBe('16 км');
    expect(formatDistance(100.234)).toBe('100 км');
  });
});

describe('createSlug', () => {
  it('создает slug из обычного текста', () => {
    expect(createSlug('Hello World')).toBe('hello-world');
  });

  it('удаляет специальные символы', () => {
    expect(createSlug('Hello, World!')).toBe('hello-world');
    expect(createSlug('Test@123#456')).toBe('test123456');
  });

  it('заменяет пробелы на дефисы', () => {
    expect(createSlug('My Awesome Title')).toBe('my-awesome-title');
  });

  it('удаляет дефисы в начале и конце', () => {
    expect(createSlug('  Hello World  ')).toBe('hello-world');
  });

  it('заменяет множественные пробелы одним дефисом', () => {
    expect(createSlug('Hello    World')).toBe('hello-world');
  });

  it('обрабатывает латиницу с пробелами', () => {
    const slug = createSlug('Hello World Test');
    expect(slug).toBe('hello-world-test');
  });
});

describe('capitalize', () => {
  it('капитализирует первую букву', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('обрабатывает пустую строку', () => {
    expect(capitalize('')).toBe('');
  });

  it('обрабатывает строку из одной буквы', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('isEmptyObject', () => {
  it('возвращает true для пустого объекта', () => {
    expect(isEmptyObject({})).toBe(true);
  });

  it('возвращает false для объекта с полями', () => {
    expect(isEmptyObject({ a: 1 })).toBe(false);
    expect(isEmptyObject({ a: 1, b: 2 })).toBe(false);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('откладывает выполнение функции', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('отменяет предыдущий вызов при новом вызове', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    vi.advanceTimersByTime(50);
    debouncedFunc();
    vi.advanceTimersByTime(50);
    
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('передает аргументы в функцию', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('test', 123);
    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith('test', 123);
  });
});
