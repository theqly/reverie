import {apolloClient} from "@/api/apolloClient.ts";
import {
  FollowUserDocument,
  GetFollowersByIdDocument,
  GetUserByNickTagDocument,
  GetUserIdByNickTagDocument, UnfollowUserDocument
} from "@/graphql/generated/graphql.ts";

/**
 * Ищет пользователя по его уникальному никнейму.
 *
 * @param {string} nickTag — Никнейм пользователя, по которому нужно выполнить поиск.
 *
 * @example
 * const user = await findUserByNickTag("alice_777");
 * // должен вернуть объект пользователя или null, если пользователь не найден
 */
export async function findUserByNickTag(nickTag: string) {
  if ( nickTag === undefined || nickTag === null || nickTag.length === 0 ) {
    return null;
  }
  try {
    const userResult = await apolloClient.query({
      query: GetUserByNickTagDocument,
      variables: {
        nickname: nickTag
      }
    });

    return userResult.data?.userByNickname || null
  } catch (error) {
    console.error('Failed to find user by nickname:', error);
  }
  return null;
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
  if (payload.username === undefined) {
    return {followers: [], totalCount: 0};
  }

  try {
    const userId = await apolloClient.query({
      query: GetUserIdByNickTagDocument,
      variables: {
        nickname: payload.username,
      }
    });
    if (!userId) {
      return {followers: [], totalCount: 0};
    }

    const followers = await apolloClient.query({
      query: GetFollowersByIdDocument,
      variables: {
        id: userId.data?.userByNickname.id,
      }
    });

    if (!followers || !followers.data) {
      return {followers: [], totalCount: 0};
    }
    return {followers: followers.data, totalCount: followers.data.length};
  } catch (error) {
    console.error('Failed to find followers:', error);
  }

  return {followers: [], totalCount: 0};
}

/**
 * Подписывает пользователя followerId на userId // TODO: или наоборот? Уточнить у команды бека надо
 *
 * @example
 * const response = await followUser(
 * "00000000-0000-0000-0000-000000000001",
 * "00000000-0000-0000-0000-000000000003"
 * );
 *
 * @return true при успешной подписке, иначе false
 */
export async function followUser(userId: string, followerId: string) : Promise< boolean > {
  try {
    const followed = await apolloClient.mutate({
      mutation: FollowUserDocument,
      variables: {
        userId: userId,
        followerId: followerId
      }
    });

    return followed.data?.followUser || false;
  } catch (error) {
    console.error('Failed to follow user:', error);
  }

  return false;
}

/**
 * Отписывает пользователя followerId от userId // TODO: или наоборот? Уточнить у команды бека надо
 *
 * @example
 * const response = await unfollowUser(
 * "00000000-0000-0000-0000-000000000001",
 * "00000000-0000-0000-0000-000000000003"
 * );
 *
 * @return true при успешной отписке, иначе false
 */
export async function unfollowUser(userId: string, followerId: string) : Promise< boolean  > {
  try {
    const unfollowed = await apolloClient.mutate({
      mutation: UnfollowUserDocument,
      variables: {
        userId: userId,
        followerId: followerId
      }
    });

    return unfollowed.data?.followUser || false;
  } catch (error) {
    console.error('Failed to follow user:', error);
  }

  return false;
}
