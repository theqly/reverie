// services/pinService.ts

// services/pinsService.ts

import {apolloClient} from "@/api/apolloClient.ts";
import {
  CreatePinDocument,
  type CreatePinInput,
  AccessLevelType,
  OwnerType,
  type UpdateBoardInput,
  type Board,
  UpdateBoardDocument,
  type CreateBoardInput,
  type UpdatePinInput,
  UpdatePinDocument, type Pin, type InputMaybe, type Scalars
} from "@/graphql/generated/graphql.ts";

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
    userId: payload.ownerId,
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