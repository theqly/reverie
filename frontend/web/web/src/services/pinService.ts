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
  info: string;
  coverImage: File | null;
  pinCount: number;
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
 * });
 */