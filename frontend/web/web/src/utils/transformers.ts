import type { Pin, Board } from '../graphql/generated/graphql';
import { getPlaceholderById, defaultAvatar } from './imageUtils';

/**
 * Тип пина для отображения в UI
 */
export interface DisplayPin {
  id: string;
  title: string;
  image: string;
  location: string;
  author: string;
  authorAvatar: string;
  latitude: number;
  longitude: number;
  ownerId: string;
}

/**
 * Тип коллекции для отображения в UI
 */
export interface DisplayCollection {
  id: string;
  title: string;
  location: string;
  image: string;
  pinsCount: number;
  author: string;
  authorAvatar: string;
  pins: Pin[];
  ownerId: string;
}

/**
 * Сортирует изображения по orderNumber и возвращает URL первого
 */
function getFirstImageUrl(images: Array<{ orderNumber?: number | null; imageUrl: string }> | null | undefined, fallbackId: string): string {
  if (!images || images.length === 0) {
    return getPlaceholderById(fallbackId);
  }

  const sorted = [...images].sort(
    (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
  );

  return sorted[0]?.imageUrl || getPlaceholderById(fallbackId);
}

/**
 * Трансформирует Pin из GraphQL в DisplayPin для UI
 */
export function transformPin(pin: Pin): DisplayPin {
  return {
    id: pin.id,
    title: pin.name,
    image: getFirstImageUrl(pin.images, pin.id),
    location: '',
    author: pin.owner?.nickname || 'Unknown',
    authorAvatar: pin.owner?.profilePicture || defaultAvatar,
    latitude: pin.latitude,
    longitude: pin.longitude,
    ownerId: pin.owner?.id || '',
  };
}

/**
 * Трансформирует Board из GraphQL в DisplayCollection для UI
 */
export function transformBoard(board: Board): DisplayCollection {
  const firstPin = board.pins?.[0];
  const imageUrl = firstPin?.images
    ? getFirstImageUrl(firstPin.images, board.id)
    : getPlaceholderById(board.id);

  return {
    id: board.id,
    title: board.name,
    location: '',
    image: imageUrl,
    pinsCount: board.pins?.length || 0,
    author: board.owner?.nickname || 'Unknown',
    authorAvatar: board.owner?.profilePicture || defaultAvatar,
    pins: board.pins || [],
    ownerId: board.owner?.id || board.ownerId || '',
  };
}

/**
 * Трансформирует массив пинов
 */
export function transformPins(pins: Pin[]): DisplayPin[] {
  return pins.map(transformPin);
}

/**
 * Трансформирует массив коллекций
 */
export function transformBoards(boards: Board[]): DisplayCollection[] {
  return boards.map(transformBoard);
}
