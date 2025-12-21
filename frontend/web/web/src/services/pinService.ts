import {apolloClient} from "@/api/apolloClient.ts";
import {
  CreatePinDocument,
  type CreatePinInput,
  type UpdatePinInput,
  UpdatePinDocument,
  type Pin, GetPinByIdDocument, IsPinLikedDocument, IsPinBookmarkedDocument, GetPinReactionIdDocument,
} from "@/graphql/generated/graphql.ts";
import {getAvailableReactions} from "@/services/reactionsService.ts";
import { 
  uploadImageDev, 
  addImageToPin, 
  removeImageFromPin,
  type ImageUploadProgress 
} from "@/services/imageService.ts";

export interface CreatePinPayload {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  ownerId: string; // UUID
  coverImages: File[]; // массив изображений
}

export interface CreatePinWithImagesResult {
  pin: Pin | null;
  uploadedImages: Array<{ id: string; imageUrl: string; orderNumber: number }>;
  errors: string[];
}

/**
 * Создаёт новый пин с заданными параметрами. Добавляет его в БД
 *
 * @param {CreatePinPayload} payload - Данные пина, которые нужно отправить.
 * 
 * @example
 * await createPin({
 *   name: "Мой пин",
 *   description: "Описание пина",
 *   latitude: 55.7558,
 *   longitude: 37.6173,
 *   ownerId: "00000000-0000-0000-0000-000000000001",
 *   coverImages: [file1, ..., file10]
 * });
 */
export async function createPin(payload: CreatePinPayload): Promise<Pin | null> {
  const createInput: any = {
    ownerId: payload.ownerId,
  };

  if (payload.description !== undefined) {
    createInput.description = payload.description;
  }

  if (payload.latitude !== undefined) {
    createInput.latitude = payload.latitude;
  }

  if (payload.longitude !== undefined) {
    createInput.longitude = payload.longitude;
  }

  if (payload.name !== undefined) {
    createInput.name = payload.name;
  }

  const createPinResult = await apolloClient.mutate({
    mutation: CreatePinDocument,
    variables: {
      input: createInput as CreatePinInput
    },
  });

  return createPinResult.data?.createPin || null;
}

/**
 * Создаёт пин и загружает изображения
 * Комплексная функция: создаёт пин, загружает фото в S3 и привязывает их к пину
 * 
 * @param payload - Данные пина включая изображения
 * @param onImageProgress - Колбэк для отслеживания прогресса загрузки изображений
 * @returns Результат создания пина с информацией о загруженных изображениях
 */
export async function createPinWithImages(
  payload: CreatePinPayload,
  onImageProgress?: (fileIndex: number, progress: ImageUploadProgress) => void
): Promise<CreatePinWithImagesResult> {
  const result: CreatePinWithImagesResult = {
    pin: null,
    uploadedImages: [],
    errors: []
  };

  // 1. Создаём пин в БД
  const pin = await createPin(payload);
  
  if (!pin) {
    result.errors.push('Не удалось создать пин');
    return result;
  }
  
  result.pin = pin;

  // 2. Если есть изображения - загружаем их
  if (payload.coverImages && payload.coverImages.length > 0) {
    for (let i = 0; i < payload.coverImages.length; i++) {
      const file = payload.coverImages[i];
      
      try {
        // Загружаем изображение (используем dev версию пока нет S3)
        // TODO: заменить на uploadImage когда будет готов S3 endpoint
        const uploadResult = await uploadImageDev(file, (progress) => {
          if (onImageProgress) {
            onImageProgress(i, progress);
          }
        });

        if (!uploadResult.success || !uploadResult.imageUrl) {
          result.errors.push(`Ошибка загрузки файла ${file.name}: ${uploadResult.error}`);
          continue;
        }

        // Добавляем изображение к пину в БД
        const pinImage = await addImageToPin(pin.id, uploadResult.imageUrl, i + 1);
        
        if (pinImage) {
          result.uploadedImages.push(pinImage);
        } else {
          result.errors.push(`Ошибка привязки файла ${file.name} к пину`);
        }
      } catch (error: any) {
        result.errors.push(`Ошибка обработки файла ${file.name}: ${error.message}`);
      }
    }
  }

  return result;
}


/**
 * Обновляет пин с заданным ID
 *
 * @param {string} pinId - ID обновляемого пина
 * @param {UpdatePinInput} input - Данные пина, которые нужно отправить.
 *
 * @example
 * await updatePin(
 * "00000000-0000-0000-0000-000000000002",
 * {
 *   name: "Мой пин",
 *   description: "Описание пина",
 *   ownerId: "00000000-0000-0000-0000-000000000001",
 * });
 */
export async function updatePin(pinId: string, input: UpdatePinInput) : Promise< Pin | null > {
  const updateInput: any = {
    userId: input.userId,
  };

  if (input.description !== undefined) {
    updateInput.description = input.description;
  }

  if (input.latitude !== undefined) {
    updateInput.latitude = input.latitude;
  }

  if (input.longitude !== undefined) {
    updateInput.longitude = input.longitude;
  }

  if (input.name !== undefined) {
    updateInput.name = input.name;
  }

  if (input.rating !== undefined) {
    updateInput.rating = input.rating;
  }

  const updatedPinResult = await apolloClient.mutate({
    mutation: UpdatePinDocument,
    variables: {
      id: pinId,
      input: updateInput as UpdatePinInput
    },
  });

  return updatedPinResult.data?.updatePin || null;
}

/**
 * Добавляет новые изображения к существующему пину
 * 
 * @param pinId - ID пина
 * @param files - Массив файлов изображений для добавления
 * @param startOrderNumber - Начальный номер порядка (для добавления в конец)
 * @param onProgress - Колбэк для отслеживания прогресса
 */
export async function addImagesToPinById(
  pinId: string,
  files: File[],
  startOrderNumber: number = 1,
  onProgress?: (fileIndex: number, progress: ImageUploadProgress) => void
): Promise<{ images: Array<{ id: string; imageUrl: string; orderNumber: number }>; errors: string[] }> {
  const images: Array<{ id: string; imageUrl: string; orderNumber: number }> = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Загружаем изображение
      const uploadResult = await uploadImageDev(file, (progress) => {
        if (onProgress) {
          onProgress(i, progress);
        }
      });

      if (!uploadResult.success || !uploadResult.imageUrl) {
        errors.push(`Ошибка загрузки файла ${file.name}: ${uploadResult.error}`);
        continue;
      }

      // Добавляем изображение к пину в БД
      const pinImage = await addImageToPin(pinId, uploadResult.imageUrl, startOrderNumber + i);
      
      if (pinImage) {
        images.push(pinImage);
      } else {
        errors.push(`Ошибка привязки файла ${file.name} к пину`);
      }
    } catch (error: any) {
      errors.push(`Ошибка обработки файла ${file.name}: ${error.message}`);
    }
  }

  return { images, errors };
}

/**
 * Удаляет изображение из пина по ID изображения
 */
export async function deletePinImage(imageId: string): Promise<boolean> {
  return removeImageFromPin(imageId);
}

/**
 * Получает пин по его ID
 * @returns Pin или null
 */
export async function getPinById(id: string): Promise<Pin | null> {
  try {
    const result = await apolloClient.query({
      query: GetPinByIdDocument,
      variables: { id },
    });
    return result.data?.pin ?? null;
  } catch (error) {
    console.error('Failed to fetch pin:', error);
    return null;
  }
}

/**
 * Получает статус лайка на пине (лайкнут/не лайкнут)
 * @returns true - лайкнут, false - нет или в случае ошибки
 */
export async function isPinLiked(id: string): Promise<boolean> {
  try {
    const result = await apolloClient.query({
      query: GetPinReactionIdDocument,
      variables: { id },
    });
    return result.data?.pin.reactionId == "8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f";
  } catch (error) {
    console.error('Failed to fetch pin:', error);
    return false;
  }
}

/**
 * Получает статус букмарка на пине (добавлен/не добавлен)
 * @returns true - добавлен, false - нет или в случае ошибки
 */
export async function isPinBookmarked(id: string): Promise<boolean> {
  try {
    const result = await apolloClient.query({
      query: IsPinBookmarkedDocument,
      variables: { id },
    });
    return result.data?.pin.bookmarked ?? false;
  } catch (error) {
    console.error('Failed to fetch pin:', error);
    return false;
  }
}