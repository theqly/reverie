import {apolloClient} from "@/api/apolloClient.ts";
import {
  CreatePinDocument,
  type CreatePinInput,
  type UpdatePinInput,
  UpdatePinDocument,
  type Pin, GetPinByIdDocument, IsPinLikedDocument, IsPinBookmarkedDocument, GetPinReactionIdDocument,
} from "@/graphql/generated/graphql.ts";
import {getAvailableReactions} from "@/services/reactionsService.ts";

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
    const reactionId = result.data?.pin.reactionId ?? false;
    const reactions = await getAvailableReactions();
    for (const reaction of reactions) {
      if (reaction.type === "like" && reaction.id === reactionId) return true;
    }
    return false;
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