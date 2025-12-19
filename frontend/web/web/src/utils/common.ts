import { describe, it, expect } from 'vitest';

// Утилиты для работы с URL
export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  return searchParams.toString();
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

// Утилита для валидации координат
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Утилита для расчета расстояния между двумя точками (формула Haversine)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Утилита для форматирования расстояния
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} м`;
  }
  if (distanceInKm < 10) {
    return `${distanceInKm.toFixed(1)} км`;
  }
  return `${Math.round(distanceInKm)} км`;
}

// Утилита для создания slug из названия
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Утилита для капитализации первой буквы
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Утилита для проверки пустого объекта
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

// Утилита для debounce
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
