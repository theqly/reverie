/**
 * Ищет пользователя по его уникальному никнейму.
 *
 * @param {string} nickname — Никнейм пользователя, по которому нужно выполнить поиск.
 *
 * @example
 * const user = await findUserByNickname("alice_777");
 * // должен вернуть объект пользователя или null, если пользователь не найден
 */
export async function findUserByNickname(nickname: string) {
  // TODO: Реализовать на бэке
}



export interface GetFollowersPayload {
  username: string; // Ник владельца профиля, у которого нужно получить подписчиков
  offset: number;   // Смещение для пагинации
  limit: number;    // Количество элементов (например, 100)
}

/**
 * Возвращает список подписчиков пользователя.
 *
 * @param {GetFollowersPayload} payload — Данные запроса.
 *
 * @example
 * const response = await getFollowers({
 *   username: "alice_777",
 *   offset: 0,
 *   limit: 100
 * });
 *
 * // должен вернуть { followers: [...], totalCount: number }
 */
export async function getFollowers(payload: GetFollowersPayload) {
  // TODO: Реализовать на бэке
}
