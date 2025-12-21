/**
 * Сервис для работы с изображениями
 * Загрузка изображений в S3 и получение URL
 */

import { apolloClient } from "@/api/apolloClient";
import { 
  AddImageToPinDocument, 
  RemoveImageFromPinDocument,
  type AddImageInput 
} from "@/graphql/generated/graphql";

// Конфигурация S3/MinIO
const S3_CONFIG = {
  // URL для загрузки файлов (может быть presigned URL endpoint или прямой upload)
  uploadEndpoint: '/api/upload', // TODO: заменить на реальный endpoint когда будет готов бэк
  // Базовый URL для доступа к файлам
  baseUrl: '/api/images', // TODO: заменить на реальный S3 URL
  // Максимальный размер файла (10MB)
  maxFileSize: 10 * 1024 * 1024,
  // Допустимые типы файлов
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  imageKey?: string;
  error?: string;
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Генерирует уникальный ключ для изображения
 */
function generateImageKey(file: File, prefix: string = 'images'): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop() || 'jpg';
  return `${prefix}/${timestamp}-${randomPart}.${extension}`;
}

/**
 * Валидирует файл изображения перед загрузкой
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!S3_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Недопустимый тип файла. Разрешены: ${S3_CONFIG.allowedTypes.join(', ')}`
    };
  }

  if (file.size > S3_CONFIG.maxFileSize) {
    const maxSizeMB = S3_CONFIG.maxFileSize / (1024 * 1024);
    return {
      valid: false,
      error: `Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Загружает изображение в S3
 * 
 * @param file - Файл изображения для загрузки
 * @param prefix - Префикс для ключа (например, 'pins', 'collections', 'profiles')
 * @param onProgress - Колбэк для отслеживания прогресса загрузки
 * @returns Promise с результатом загрузки
 */
export async function uploadImage(
  file: File,
  prefix: string = 'images',
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<UploadResult> {
  // Валидация файла
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const imageKey = generateImageKey(file, prefix);

  try {
    // Получаем токен авторизации
    const token = localStorage.getItem('authToken');

    // Создаем FormData для multipart upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', imageKey);

    // Используем XMLHttpRequest для отслеживания прогресса
    const uploadPromise = new Promise<UploadResult>((resolve) => {
      const xhr = new XMLHttpRequest();

      // Отслеживание прогресса
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              imageUrl: response.url || `${S3_CONFIG.baseUrl}/${imageKey}`,
              imageKey: response.key || imageKey
            });
          } catch {
            // Если бэк не вернул JSON, используем сгенерированный URL
            resolve({
              success: true,
              imageUrl: `${S3_CONFIG.baseUrl}/${imageKey}`,
              imageKey: imageKey
            });
          }
        } else {
          resolve({
            success: false,
            error: `Ошибка загрузки: ${xhr.status} ${xhr.statusText}`
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Сетевая ошибка при загрузке файла'
        });
      });

      xhr.addEventListener('abort', () => {
        resolve({
          success: false,
          error: 'Загрузка была отменена'
        });
      });

      xhr.open('POST', S3_CONFIG.uploadEndpoint);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка при загрузке'
    };
  }
}

/**
 * Загружает изображение через Data URL (fallback для dev/testing)
 * Конвертирует файл в base64 и использует как временный URL
 * 
 * ВАЖНО: Использовать только для разработки! 
 * В продакшене нужно использовать uploadImage
 */
export function createLocalImageUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Создает объектный URL для превью изображения
 * Более производительный чем base64, но нужно не забыть освободить память
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Освобождает память, занятую объектным URL
 */
export function revokePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Загружает несколько изображений параллельно
 */
export async function uploadMultipleImages(
  files: File[],
  prefix: string = 'images',
  onProgress?: (fileIndex: number, progress: ImageUploadProgress) => void
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) => 
    uploadImage(file, prefix, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Добавляет изображение к пину в БД
 * Вызывается после успешной загрузки в S3
 */
export async function addImageToPin(
  pinId: string,
  imageUrl: string,
  orderNumber: number
): Promise<{ id: string; imageUrl: string; orderNumber: number } | null> {
  try {
    const result = await apolloClient.mutate({
      mutation: AddImageToPinDocument,
      variables: {
        input: {
          pinId,
          imageUrl,
          orderNumber
        } as AddImageInput
      }
    });

    return result.data?.addImageToPin || null;
  } catch (error) {
    console.error('Error adding image to pin:', error);
    return null;
  }
}

/**
 * Удаляет изображение из пина
 */
export async function removeImageFromPin(imageId: string): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: RemoveImageFromPinDocument,
      variables: { imageId }
    });

    return result.data?.removeImageFromPin ?? false;
  } catch (error) {
    console.error('Error removing image from pin:', error);
    return false;
  }
}

/**
 * Загружает изображения для пина и добавляет их в БД
 * Комплексная функция, объединяющая upload + addImageToPin
 */
export async function uploadAndAddPinImages(
  pinId: string,
  files: File[],
  onProgress?: (fileIndex: number, progress: ImageUploadProgress) => void
): Promise<{ success: boolean; images: Array<{ id: string; imageUrl: string; orderNumber: number }>; errors: string[] }> {
  const images: Array<{ id: string; imageUrl: string; orderNumber: number }> = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // 1. Загружаем в S3
    const uploadResult = await uploadImage(file, `pins/${pinId}`, (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });

    if (!uploadResult.success || !uploadResult.imageUrl) {
      errors.push(`Ошибка загрузки файла ${file.name}: ${uploadResult.error}`);
      continue;
    }

    // 2. Добавляем в БД
    const pinImage = await addImageToPin(pinId, uploadResult.imageUrl, i + 1);
    
    if (pinImage) {
      images.push(pinImage);
    } else {
      errors.push(`Ошибка добавления файла ${file.name} к пину`);
    }
  }

  return {
    success: errors.length === 0,
    images,
    errors
  };
}

/**
 * Временная функция для разработки
 * Симулирует загрузку и возвращает локальный URL
 * 
 * TODO: Удалить когда будет готов S3 endpoint
 */
export async function uploadImageDev(
  file: File,
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<UploadResult> {
  // Валидация файла
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Симулируем прогресс загрузки
  if (onProgress) {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onProgress({
        loaded: (file.size / steps) * i,
        total: file.size,
        percentage: (i / steps) * 100
      });
    }
  }

  // Возвращаем Data URL как временное решение
  const dataUrl = await createLocalImageUrl(file);
  
  return {
    success: true,
    imageUrl: dataUrl,
    imageKey: generateImageKey(file)
  };
}
