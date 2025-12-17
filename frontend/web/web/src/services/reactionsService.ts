import {apolloClient} from "@/api/apolloClient.ts";
import {
  type Board,
  CountAllReactionsToBoardDocument,
  CountAllReactionsToPinDocument,
  GetAvailableReactionsDocument, GetLikedBoardsByUserIdDocument, GetLikedPinsByUserIdDocument, type Pin,
  type Reaction, ReactionToBoardDocument, ReactionToPinDocument
} from "@/graphql/generated/graphql.ts";
import {resolveUserId} from "@/services/profileService.ts";



/**
 * Получает список всех доступных типов реакций
 * @returns Массив объектов Reaction или пустой массив
 */
export async function getAvailableReactions(): Promise<Reaction[]> {
  try {
    const result = await apolloClient.query({
      query: GetAvailableReactionsDocument,
    });
    return result.data?.reactions ?? [];
  } catch (error) {
    console.error('Failed to fetch available reactions:', error);
    return [];
  }
}

/**
 * Подсчитывает общее количество реакций для пина
 * @param params - Объект параметров
 * @param params.pinId - ID пина
 * @returns Количество реакций
 */
export async function countReactionsToPin(
  params: { pinId: string }
): Promise<number> {
  try {
    const result = await apolloClient.query({
      query: CountAllReactionsToPinDocument,
      variables: params,
    });
    return result.data?.countAllReactionsToPin ?? 0;
  } catch (error) {
    console.error(`Failed to count reactions for Pin ${params.pinId}:`, error);
    return 0;
  }
}

/**
 * Подсчитывает общее количество реакций для доски
 * @param params - Объект параметров
 * @param params.boardId - ID доски
 * @returns Количество реакций
 */
export async function countReactionsToBoard(
  params: { boardId: string }
): Promise<number> {
  try {
    const result = await apolloClient.query({
      query: CountAllReactionsToBoardDocument,
      variables: params,
    });
    return result.data?.countAllReactionsToBoard ?? 0;
  } catch (error) {
    console.error(`Failed to count reactions for Board ${params.boardId}:`, error);
    return 0;
  }
}

/**
 * Устанавливает или снимает реакцию для пина
 *
 * @param params - Объект параметров
 * @param params.pinId - ID пина
 * @param params.reactionId - ID типа реакции
 * @param params.userId - ID пользователя, ставящего реакцию
 */
export async function reactToPin(
  params: { pinId: string; reactionId: string; userId: string }
): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: ReactionToPinDocument,
      variables: params,
    });
    return result.data?.reactionToPin === true;
  } catch (error) {
    console.error(`Failed to set reaction on Pin ${params.pinId}:`, error);
    return false;
  }
}

/**
 * Устанавливает или снимает реакцию для доски
 *
 * @param params - Объект параметров
 * @param params.boardId - ID доски
 * @param params.reactionId - ID типа реакции
 * @param params.userId - ID пользователя, ставящего реакцию
 */
export async function reactToBoard(
  params: { boardId: string; reactionId: string; userId: string }
): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: ReactionToBoardDocument,
      variables: params,
    });
    return result.data?.reactionToBoard === true;
  } catch (error) {
    console.error(`Failed to set reaction on Board ${params.boardId}:`, error);
    return false;
  }
}

/**
 * Получает список пинов, которые лайкнул пользователь.
 *
 * @param params - Объект параметров
 * @param params.userId - (Опционально) ID пользователя
 * @param params.nickTag - (Опционально) NickTag пользователя
 * @param params.limit - (Опционально) Лимит выборки
 * @param params.offset - (Опционально) Смещение
 * @returns Массив лайкнутых пинов или null
 */
export async function getLikedPinsByUser(
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
      query: GetLikedPinsByUserIdDocument,
      variables
    });
    return result.data?.likedPinsByUser ?? null;
  } catch (error) {
    console.error('Failed to get liked pins:', error);
    return null;
  }
}

/**
 * Получает список досок, которые лайкнул пользователь
 *
 * @param params - Объект параметров
 * @param params.userId - (Опционально) ID пользователя
 * @param params.nickTag - (Опционально) NickTag пользователя
 * @param params.limit - (Опционально) Лимит выборки
 * @param params.offset - (Опционально) Смещение
 * @returns Массив лайкнутых досок или null
 */
export async function getLikedBoardsByUser(
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
      query: GetLikedBoardsByUserIdDocument,
      variables
    });
    return result.data?.likedBoardsByUser ?? null;
  } catch (error) {
    console.error('Failed to get liked boards:', error);
    return null;
  }
}