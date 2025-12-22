import {apolloClient} from "@/api/apolloClient.ts";
import {
  type Board,
  BookmarkToBoardDocument,
  BookmarkToPinDocument, GetBookmarkedBoardsByUserIdDocument, GetBookmarkedPinsByUserIdDocument, type Pin,
} from "@/graphql/generated/graphql.ts";
import {resolveUserId} from "@/services/profileService.ts";

/**
 * Добавляет или удаляет пин из закладок пользователя
 *
 * @param params - Объект параметров
 * @param params.pinId - ID пина
 * @param params.userId - ID пользователя
 */
export async function toggleBookmarkToPin(
  params: { pinId: string; userId: string }
): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: BookmarkToPinDocument,
      variables: params,
    });
    return result.data?.bookmarkToPin === true;
  } catch (error) {
    console.error(`Failed to toggle bookmark for Pin ${params.pinId}:`, error);
    return false;
  }
}

/**
 * Добавляет или удаляет доску из закладок пользователя
 *
 * @param params - Объект параметров
 * @param params.boardId - ID доски
 * @param params.userId - ID пользователя
 */
export async function toggleBookmarkToBoard(
  params: { boardId: string; userId: string }
): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: BookmarkToBoardDocument,
      variables: params,
    });
    return result.data?.bookmarkToBoard === true;
  } catch (error) {
    console.error(`Failed to toggle bookmark for Board ${params.boardId}:`, error);
    return false;
  }
}

/**
 * Получает список пинов, добавленных пользователем в закладки.
 *
 * @param params - Объект параметров
 * @param params.userId - (Опционально) ID пользователя
 * @param params.nickTag - (Опционально) NickTag пользователя
 * @param params.limit - (Опционально) Лимит выборки
 * @param params.offset - (Опционально) Смещение
 * @returns Массив пинов в закладках или null
 */
export async function getBookmarkedPinsByUser(
  params: {
    userId?: string;
    nickTag?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Pin[] | null> {
  const finalUserId = await resolveUserId({
    userId: params.userId,
    nickTag: params.nickTag
  });

  if (!finalUserId) {
    return null;
  }

  try {
    const variables: any = { userId: finalUserId };

    if (params.limit !== undefined) {
      variables.limit = params.limit;
    }
    if (params.offset !== undefined) {
      variables.offset = params.offset;
    }

    const result = await apolloClient.query({
      query: GetBookmarkedPinsByUserIdDocument,
      variables
    });
    return result.data?.bookmarkedPinsByUser ?? null;
  } catch (error) {
    console.error('Failed to get bookmarked pins:', error);
    return null;
  }
}

/**
 * 11. Получает список досок, добавленных пользователем в закладки.
 *
 * @param params - Объект параметров.
 * @param params.userId - (Опционально) ID пользователя.
 * @param params.nickTag - (Опционально) NickTag пользователя.
 * @param params.limit - (Опционально) Лимит выборки.
 * @param params.offset - (Опционально) Смещение.
 * @returns Массив досок в закладках или null.
 */
export async function getBookmarkedBoardsByUser(
  params: {
    userId?: string;
    nickTag?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Board[] | null> {
  const finalUserId = await resolveUserId({
    userId: params.userId,
    nickTag: params.nickTag
  });

  if (!finalUserId) {
    return null;
  }

  try {
    const variables: any = { userId: finalUserId };

    if (params.limit !== undefined) {
      variables.limit = params.limit;
    }
    if (params.offset !== undefined) {
      variables.offset = params.offset;
    }

    const result = await apolloClient.query({
      query: GetBookmarkedBoardsByUserIdDocument,
      variables
    });
    return result.data?.bookmarkedBoardsByUser ?? null;
  } catch (error) {
    console.error('Failed to get bookmarked boards:', error);
    return null;
  }
}