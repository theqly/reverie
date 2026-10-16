
import { apolloClient } from '@/api/apolloClient.ts';

import {
  CreatePinDocument,
  type CreatePinInput,
  type UpdatePinInput,
  UpdatePinDocument,
  type Pin,
  GetPinByIdDocument,
  IsPinBookmarkedDocument,
  GetPinReactionIdDocument,
  type GetPinByIdQuery,
  type UpdatePinMutation,
} from '@/graphql/generated/graphql.ts';

import {
  uploadImageDev,
  addImageToPin,
  removeImageFromPin,
  type ImageUploadProgress,
} from '@/services/imageService.ts';

export interface CreatePinPayload {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  coverImages: File[];
}

export interface CreatePinWithImagesResult {
  pin: Pin | null;
  uploadedImages: Array<{
    id: string;
    imageUrl: string;
    orderNumber: number;
  }>;
  errors: string[];
}

/**
 * Создаёт пин в БД без загрузки изображений.
 */
export async function createPin(
  payload: CreatePinPayload,
): Promise<Pin | null> {
  const createInput: CreatePinInput = {
    ownerId: payload.ownerId,
    name: payload.name,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
  };

  const result = await apolloClient.mutate({
    mutation: CreatePinDocument,
    variables: { input: createInput },
  });

  return result.data?.createPin ?? null;
}

/**
 * Создаёт пин, загружает изображения
 * и привязывает их к созданному пину.
 */
export async function createPinWithImages(
  payload: CreatePinPayload,
  onImageProgress?: (
    fileIndex: number,
    progress: ImageUploadProgress,
  ) => void,
): Promise<CreatePinWithImagesResult> {
  const result: CreatePinWithImagesResult = {
    pin: null,
    uploadedImages: [],
    errors: [],
  };

  // 1. Создаём пин
  const pin = await createPin(payload);

  if (!pin) {
    result.errors.push('Не удалось создать пин');
    return result;
  }

  result.pin = pin;

  // 2. Загружаем изображения
  for (let i = 0; i < payload.coverImages.length; i++) {
    const file = payload.coverImages[i];

    try {
      const uploadResult = await uploadImageDev(
        file,
        (progress) => {
          onImageProgress?.(i, progress);
        },
      );

      if (!uploadResult.success || !uploadResult.imageUrl) {
        result.errors.push(
          `Ошибка загрузки файла ${file.name}: ${uploadResult.error}`,
        );
        continue;
      }

      // 3. Привязываем изображение к пину
      const pinImage = await addImageToPin(
        pin.id,
        uploadResult.imageUrl,
        i + 1,
      );

      if (pinImage) {
        result.uploadedImages.push(pinImage);
      } else {
        result.errors.push(
          `Ошибка привязки файла ${file.name} к пину`,
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);

      result.errors.push(
        `Ошибка обработки файла ${file.name}: ${message}`,
      );
    }
  }

  return result;
}

/**
 * Обновляет существующий пин.
 */
type UpdatedPin = UpdatePinMutation['updatePin'];

export async function updatePin(
  pinId: string,
  input: UpdatePinInput,
): Promise<UpdatedPin | null> {
  const updateInput: UpdatePinInput = {
    userId: input.userId,
    name: input.name,
    description: input.description,
    latitude: input.latitude,
    longitude: input.longitude,
    rating: input.rating,
  };

  const result = await apolloClient.mutate({
    mutation: UpdatePinDocument,
    variables: {
      id: pinId,
      input: updateInput,
    },
  });

  return result.data?.updatePin ?? null;
}

/**
 * Добавляет изображения к существующему пину.
 */
export async function addImagesToPinById(
  pinId: string,
  files: File[],
  startOrderNumber: number = 1,
  onProgress?: (
    fileIndex: number,
    progress: ImageUploadProgress,
  ) => void,
): Promise<{
  images: Array<{
    id: string;
    imageUrl: string;
    orderNumber: number;
  }>;
  errors: string[];
}> {
  const images: Array<{
    id: string;
    imageUrl: string;
    orderNumber: number;
  }> = [];

  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const uploadResult = await uploadImageDev(
        file,
        (progress) => {
          onProgress?.(i, progress);
        },
      );

      if (!uploadResult.success || !uploadResult.imageUrl) {
        errors.push(
          `Ошибка загрузки файла ${file.name}: ${uploadResult.error}`,
        );
        continue;
      }

      const pinImage = await addImageToPin(
        pinId,
        uploadResult.imageUrl,
        startOrderNumber + i,
      );

      if (pinImage) {
        images.push(pinImage);
      } else {
        errors.push(
          `Ошибка привязки файла ${file.name} к пину`,
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);

      errors.push(
        `Ошибка обработки файла ${file.name}: ${message}`,
      );
    }
  }

  return { images, errors };
}

/**
 * Удаляет изображение пина.
 */
export async function deletePinImage(
  imageId: string,
): Promise<boolean> {
  return removeImageFromPin(imageId);
}

/**
 * Получает пин по ID.
 *
 * Возвращаемый тип соответствует полям GetPinById.
 */
type PinById = NonNullable<GetPinByIdQuery['pin']>;

export async function getPinById(
  id: string,
): Promise<PinById | null> {
  try {
    const result = await apolloClient.query({
      query: GetPinByIdDocument,
      variables: { id },
    });

    return result.data?.pin ?? null;
  } catch (error: unknown) {
    console.error('Failed to fetch pin:', error);
    return null;
  }
}

/**
 * Проверяет текущую реакцию на пине.
 *
 * Примечание: при работе без JWT результат может
 * не соответствовать временному пользователю.
 */
export async function isPinLiked(
  id: string,
): Promise<boolean> {
  try {
    const result = await apolloClient.query({
      query: GetPinReactionIdDocument,
      variables: { id },
    });

    return (
      result.data?.pin?.reactionId ===
      '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f'
    );
  } catch (error: unknown) {
    console.error('Failed to fetch pin reaction:', error);
    return false;
  }
}

/**
 * Проверяет, находится ли пин в закладках.
 *
 * Примечание: при работе без JWT результат может
 * не соответствовать временному пользователю.
 */
export async function isPinBookmarked(
  id: string,
): Promise<boolean> {
  try {
    const result = await apolloClient.query({
      query: IsPinBookmarkedDocument,
      variables: { id },
    });

    return result.data?.pin?.bookmarked ?? false;
  } catch (error: unknown) {
    console.error('Failed to fetch pin bookmark:', error);
    return false;
  }
}
