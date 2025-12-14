// services/pinService.ts

// services/pinsService.ts

import {apolloClient} from "@/api/apolloClient.ts";
import {
  CreatePinDocument,
  type CreatePinInput,
  AccessLevelType,
  OwnerType
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

}