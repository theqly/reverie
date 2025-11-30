// services/collectionsService.ts

export interface CreateCollectionPayload {
  name: string;
  info: string;
  coverImage: File | null;
  collaborators: string[];
}

/**
 * Создаёт новую коллекцию с заданными параметрами. Добавляет ее в БД
 *
 * @param {CreateCollectionPayload} payload - Данные коллекции, которые нужно отправить.
 *
 * @example
 * await createCollection({
 *   name: "Моя коллекция",
 *   info: "Описание коллекции",
 *   coverImage: file,
 *   collaborators: ["Alice", "Bob"]
 * });
 */
export async function createCollection(payload: CreateCollectionPayload) {
  // TODO: Реализовать на бэке
}
