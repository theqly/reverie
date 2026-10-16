import { apolloClient } from '@/api/apolloClient.ts';
import {
  CreatePinDocument,
  type CreatePinInput,
  type UpdatePinInput,
  UpdatePinDocument,
  GetPinByIdDocument,
  IsPinBookmarkedDocument,
  GetPinReactionIdDocument,
  type GetPinByIdQuery,
  type UpdatePinMutation,
} from '@/graphql/generated/graphql.ts';

export interface CreatePinPayload {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  ownerId: string; // UUID
  coverImages: File[]; // массив изображений, пока вроде на бэке нету надо прибить гвоздями
}

/**
 * Создаёт новый пин с заданными параметрами. Добавляет его в БД
 *
 * @param {CreatePinPayload} payload - Данные пина, которые нужно отправить.
 *
 * @example
 * await createPin({
 *   name: "Мой пин",
 *   info: "Описание пина",
 *   coverImage: file,
 *   pinCount: 10
 *   ownerId: "00000000-0000-0000-0000-000000000001"
 *   coverImage: [file1, ..., file10]
 * });
 */
export async function createPin(payload: CreatePinPayload) {
  const createInput: CreatePinInput = {
    ownerId: payload.ownerId,
    name: payload.name,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
  };

  const createPinResult = await apolloClient.mutate({
    mutation: CreatePinDocument,
    variables: { input: createInput },
  });

  return createPinResult.data?.createPin || null;
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

  const updatedPinResult = await apolloClient.mutate({
    mutation: UpdatePinDocument,
    variables: {
      id: pinId,
      input: updateInput,
    },
  });

  return updatedPinResult.data?.updatePin ?? null;
}

/**
 * Получает пин по его ID
 * @returns Pin или null
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
    return result.data?.pin.reactionId == '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f';
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
