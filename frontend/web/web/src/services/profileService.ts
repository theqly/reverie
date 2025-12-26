import {apolloClient} from "@/api/apolloClient.ts";
import {
  type Board, GetBookmarkedBoardsByUserIdDocument, GetBookmarkedPinsByUserIdDocument,
  GetLikedBoardsByUserIdDocument,
  GetLikedPinsByUserIdDocument,
  GetOwnBoardsByUserIdDocument,
  GetPinsByUserIdDocument,
  GetAllPinsDocument,
  GetAllBoardsDocument,
  GetUserByIdDocument,
  GetUserByNickTagDocument,
  type Pin,
  UpdateUserDocument,
  type UpdateUserInput,
  type User,
} from "@/graphql/generated/graphql.ts";

export async function resolveUserId(
  params: { userId?: string; nickTag?: string }
): Promise<string | null> {

  // Если оба существуют или оба отсутствуют — ошибка.
  if (!!params.userId === !!params.nickTag) {
    console.warn("resolveUserId: You must provide exactly one identifier: userId OR nickTag.");
    return null;
  }

  // Если userId уже есть — возвращаем его
  if (params.userId) {
    return params.userId;
  }

  // Если есть nickTag — ищем ID
  if (params.nickTag) {
    const foundId = await getUserIdByNickTag(params.nickTag);
    if (!foundId) {
      console.warn(`User with nickTag "${params.nickTag}" not found.`);
      return null;
    }
    return foundId;
  }

  return null;
}

/**
 * Ищет пользователя по уникальной информации о нём.
 *
 * @param {string, string } userInfo — информация о пользователе, по которой его можно идентифицировать \
 * Можно передать что-то одно.
 *
 * @example
 * const user = await findUser({nickTag: "alice_777"});
 * const user = await findUser({id: "00000000-0000-0000-0000-000000000001"});
 * // должен вернуть объект пользователя или null, если пользователь не найден
 */
export async function findUser(
  userInfo: { id?: string; nickTag?: string }
): Promise<User | null> {
  if (userInfo.id == null && userInfo.nickTag == null) {
    throw new Error("At least one of 'id' or 'nickTag' must be provided");
  }

  try {
    if (userInfo.id != null) {
      const userResult = await apolloClient.query({
        query: GetUserByIdDocument,
        variables: {
          userId: userInfo.id
        }
      });
      return userResult.data?.userById || null
    } else if (userInfo.nickTag != null) {
      const userResult = await apolloClient.query({
        query: GetUserByNickTagDocument,
        variables: {
          nickTag: userInfo.nickTag
        }
      });
      return userResult.data?.userByTag || null
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to find user by nickname:', error);
  }
  return null;
}

/**
 * Возвращает ID пользователя по его nickTag, либо null, если пользователя с таким nickTag нет.
 */
export async function getUserIdByNickTag(userId: string): Promise<string | null> {
  try {
    if (userId != null) {
      const userResult = await apolloClient.query({
        query: GetUserByIdDocument,
        variables: {
          userId: userId
        }
      });
      return userResult.data?.userById?.id || null
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to find user by nickname:', error);
  }
  return null;
}

/**
 * Возвращает пины пользователя или null, если пользователь не найден.
 * Если userId и nickTag одновременно переданы или не переданы, также возвращает null
 *
 * @param {string, string, string, string} params — параметры для запроса
 *
 * @example const pins = await getPinsByUserId({nickTag: "alice_777", viewerId: "00000000-0000-0000-0000-000000000001", limit: 10, offset: 0});
 */
export async function getPinsByUser(
  params: {
    userId?: string;
    nickTag?: string;
    viewerId?: string;
    limit?: number; // default = 10
    offset?: number // default = 0
  }
): Promise<[Pin] | null> {

  const finalUserId = await resolveUserId({
    userId: params.userId,
    nickTag: params.nickTag
  });

  if (!finalUserId) {
    return null;
  }

  try {

    const variables: any = {
      userId: finalUserId,
    };

    if (params.viewerId !== undefined) {
      variables.viewerId = params.viewerId;
    }

    if (params.limit !== undefined) {
      variables.limit = params.limit;
    }

    if (params.offset !== undefined) {
      variables.offset = params.offset;
    }

    const pinsResult = await apolloClient.query({
      query: GetPinsByUserIdDocument,
      variables
    });
    return pinsResult.data?.pinsByUser || null;

  } catch (error) {
    console.error('Failed to get pins by user:', error);
  }
  return null;
}

/**
 * Возвращает доски пользователя или null, если пользователь не найден.
 * Если userId и nickTag одновременно переданы или не переданы, также возвращает null
 *
 * @param {string, string, string, string} params — параметры для запроса
 *
 * @example const pins = await getOwnBoardsByUserId({nickTag: "alice_777", limit: 10, offset: 0});
 */
export async function getOwnBoardsByUser(
  params: {
    userId?: string;
    nickTag?: string;
    limit?: number; // default = 10
    offset?: number // default = 0
  }
): Promise<[Pin] | null> {

  const finalUserId = await resolveUserId({
    userId: params.userId,
    nickTag: params.nickTag
  });

  if (!finalUserId) {
    return null;
  }

  try {

    const variables: any = {
      userId: finalUserId,
    };

    if (params.limit !== undefined) {
      variables.limit = params.limit;
    }

    if (params.offset !== undefined) {
      variables.offset = params.offset;
    }

    const boardsOwnByUserResult = await apolloClient.query({
      query: GetOwnBoardsByUserIdDocument,
      variables
    });
    return boardsOwnByUserResult.data?.ownBoardsByUser || null;

  } catch (error) {
    console.error('Failed to get boards by user:', error);
  }
  return null;
}


/**
 * Возвращает два массива лайкнутых пинов и досок пользователя или null, если пользователь не найден.
 * Если userId и nickTag одновременно переданы или не переданы, также возвращает null
 *
 * @example const likes = await getLikesByUser({nickTag: "alice_777", pinsLimit: 10, pinsOffset = 0, boardsLimit = 10, boardsOffset = 0});
 */
export async function getLikesByUser(
  params: {
    userId?: string;
    nickTag?: string;
    pinsLimit?: number; // default = 10
    pinsOffset?: number; // default = 0
    boardsLimit?: number; // default = 10
    boardsOffset?: number // default = 0
  }
): Promise< { pins: Pin[]; boards: Board[] } | null> {

  const finalUserId = await resolveUserId({
    userId: params.userId,
    nickTag: params.nickTag
  });

  if (!finalUserId) {
    return null;
  }

  try {

    const pinsVariables: any = {
      userId: finalUserId,
    };

    if (params.pinsLimit !== undefined) {
      pinsVariables.pinsLimit = params.pinsLimit;
    }

    if (params.pinsOffset !== undefined) {
      pinsVariables.pinsOffset = params.pinsOffset;
    }

    const boardsVariables: any = {
      userId: finalUserId,
    };
    if (params.boardsLimit !== undefined) {
      boardsVariables.boardsLimit = params.boardsLimit;
    }

    if (params.boardsOffset !== undefined) {
      boardsVariables.boardsOffset = params.boardsOffset;
    }

    const likedPinsResult = await apolloClient.query({
      query: GetLikedPinsByUserIdDocument,
      variables: pinsVariables
    });

    const likedBoardsResult = await apolloClient.query({
      query: GetLikedBoardsByUserIdDocument,
      variables: boardsVariables
    });

    return {
      pins: likedPinsResult.data?.likedPinsByUser ?? [],
      boards: likedBoardsResult.data?.likedBoardsByUser ?? [],
    };

  } catch (error) {
    console.error('Failed to likes by user:', error);
  }

  return null;
}


/**
 * Возвращает два массива добавленных в закладки пинов и досок пользователя или null, если пользователь не найден.
 * Если userId и nickTag одновременно переданы или не переданы, также возвращает null
 *
 * @example const likes = await getBookmarksByUser({nickTag: "alice_777", pinsLimit: 10, pinsOffset = 0, boardsLimit = 10, boardsOffset = 0});
 */
export async function getBookmarksByUser(
  params: {
    userId?: string;
    nickTag?: string;
    pinsLimit?: number; // default = 10
    pinsOffset?: number; // default = 0
    boardsLimit?: number; // default = 10
    boardsOffset?: number // default = 0
  }
): Promise< { pins: Pin[]; boards: Board[] } | null> {

  const finalUserId = await resolveUserId({
    userId: params.userId,
    nickTag: params.nickTag
  });

  if (!finalUserId) {
    return null;
  }

  try {

    const pinsVariables: any = {
      userId: finalUserId,
    };

    if (params.pinsLimit !== undefined) {
      pinsVariables.pinsLimit = params.pinsLimit;
    }

    if (params.pinsOffset !== undefined) {
      pinsVariables.pinsOffset = params.pinsOffset;
    }

    const boardsVariables: any = {
      userId: finalUserId,
    };
    if (params.boardsLimit !== undefined) {
      boardsVariables.boardsLimit = params.boardsLimit;
    }

    if (params.boardsOffset !== undefined) {
      boardsVariables.boardsOffset = params.boardsOffset;
    }

    const bookmarkedPinsResult = await apolloClient.query({
      query: GetBookmarkedPinsByUserIdDocument,
      variables: pinsVariables
    });

    const bookmarkedBoardsResult = await apolloClient.query({
      query: GetBookmarkedBoardsByUserIdDocument,
      variables: boardsVariables
    });

    return {
      pins: bookmarkedPinsResult.data?.likedPinsByUser ?? [],
      boards: bookmarkedBoardsResult.data?.likedBoardsByUser ?? [],
    };

  } catch (error) {
    console.error('Failed to likes by user:', error);
  }

  return null;
}

/**
 * Обновляет пользователя с заданным ID
 *
 * @param {string} userId - ID обновляемого пользователя
 * @param {UpdateUserInput} input - Данные пользователя, которые нужно установить.
 *
 * @example
 * await updateUser(
 * "00000000-0000-0000-0000-000000000002",
 * {
 *   nickname: "Крутой никнейм 2012",
 *   description: "Описание пользователя",
 *   nick_tag: "asd1",
 *   email: "mail123@mail.ru"
 * });
 */
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
  try {
    const userResult = await apolloClient.mutate({
      mutation: UpdateUserDocument,
      variables: {
        userId: userId,
        input: input
      }
    });

    return userResult.data?.updateUser || null;
  } catch (error) {
    console.error('Failed to update user:', error);
  }

  return null;
}

export async function getAllPins(
  params: { viewerId?: string; limit?: number; offset?: number }
): Promise<Pin[] | null> {
  try {
    const result = await apolloClient.query({
      query: GetAllPinsDocument,
      variables: { viewerId: params.viewerId, limit: params.limit, offset: params.offset },
      fetchPolicy: 'network-only',
    });
    return result.data?.pins || null;
  } catch (error) {
    console.error('[getAllPins] Failed:', error);
    return null;
  }
}

export async function getAllBoards(
  params: { viewerId?: string; limit?: number; offset?: number }
): Promise<Board[] | null> {
  try {
    const result = await apolloClient.query({
      query: GetAllBoardsDocument,
      variables: { viewerId: params.viewerId, limit: params.limit, offset: params.offset },
      fetchPolicy: 'network-only',
    });
    return result.data?.boards || null;
  } catch (error) {
    console.error('[getAllBoards] Failed:', error);
    return null;
  }
}
