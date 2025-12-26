/**
 * Типы для работы с изображениями
 */

/**
 * Изображение пина (из API)
 */
export interface PinImage {
  id: string;
  imageUrl: string;
  orderNumber: number;
}

/**
 * Результат загрузки изображения
 */
export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  imageKey?: string;
  error?: string;
}

/**
 * Прогресс загрузки изображения
 */
export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Конфигурация для загрузки изображений
 */
export interface ImageUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadEndpoint: string;
  baseUrl: string;
}

/**
 * Состояние галереи изображений
 */
export interface ImageGalleryState {
  newImages: File[];           // Новые изображения для загрузки
  existingImages: PinImage[];  // Существующие изображения с сервера
  deletedImageIds: string[];   // ID изображений для удаления
  currentIndex: number;        // Текущий индекс в галерее
}

/**
 * Результат загрузки нескольких изображений
 */
export interface MultipleUploadResult {
  success: boolean;
  images: PinImage[];
  errors: string[];
}

/**
 * Типы допустимых изображений
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const;

export type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];

/**
 * Максимальный размер файла (10MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Максимальное количество изображений для пина
 */
export const MAX_PIN_IMAGES = 10;
