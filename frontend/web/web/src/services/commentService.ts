import {apolloClient} from "@/api/apolloClient.ts";
import {
  AddCommentToBoardDocument, type AddCommentToBoardInput,
  AddCommentToPinDocument,
  type AddCommentToPinInput, type CommentToBoard,
  type CommentToPin,
  DeleteCommentToBoardDocument,
  DeleteCommentToPinDocument, GetCommentsByBoardIdDocument,
  GetCommentsByPinIdDocument, UpdateCommentToBoardDocument,
  UpdateCommentToPinDocument

} from "@/graphql/generated/graphql.ts";




/**
 * Получает список комментариев к Пину.
 * Дефолтные значения (limit = 10, offset = 0) управляются на бэкенде.
 *
 * @param params - Объект параметров.
 * @param params.pinId - ID пина (обязательный).
 * @param params.limit - (Опционально) Максимальное количество комментариев.
 * @param params.offset - (Опционально) Смещение.
 * @returns Массив комментариев или пустой массив.
 */
export async function getCommentsByPin(
  params: {
    pinId: string;
    limit?: number;
    offset?: number;
  }
): Promise<CommentToPin[]> {
  try {
    // Формируем переменные, включая только те, что переданы
    const variables: { pinId: string; limit?: number; offset?: number } = { pinId: params.pinId };

    if (params.limit !== undefined) {
      variables.limit = params.limit;
    }
    if (params.offset !== undefined) {
      variables.offset = params.offset;
    }

    const result = await apolloClient.query({
      query: GetCommentsByPinIdDocument,
      variables,
    });
    return result.data?.commentsByPin ?? [];
  } catch (error) {
    console.error(`Failed to fetch comments for Pin ${params.pinId}:`, error);
    return [];
  }
}

/**
 * Добавляет новый комментарий к Пину.
 *
 * @param params - Содержит все поля для AddCommentToPinInput.
 * @returns Созданный объект CommentToPin или null.
 */
export async function addCommentToPin(
  params: AddCommentToPinInput
): Promise<CommentToPin | null> {
  try {
    const result = await apolloClient.mutate({
      mutation: AddCommentToPinDocument,
      variables: { input: params }, // Передаем весь объект в качестве 'input'
    });
    return result.data?.addCommentToPin || null;
  } catch (error) {
    console.error('Failed to add comment to pin:', error);
    return null;
  }
}

/**
 * Обновляет текст существующего комментария к Пину.
 *
 * @param params - Объект параметров.
 * @param params.id - ID комментария (обязательный).
 * @param params.message - Новый текст сообщения (обязательный).
 * @returns Обновленный объект CommentToPin или null.
 */
export async function updatePinComment(
  params: {
    id: string;
    message: string;
  }
): Promise<CommentToPin | null> {
  try {
    const result = await apolloClient.mutate({
      mutation: UpdateCommentToPinDocument,
      variables: params, // Передаем id и message
    });
    return result.data?.updateCommentToPin || null;
  } catch (error) {
    console.error(`Failed to update pin comment ${params.id}:`, error);
    return null;
  }
}

/**
 * Удаляет комментарий к Пину.
 *
 * @param params - Объект параметров.
 * @param params.id - ID комментария (обязательный).
 * @returns true, если удаление прошло успешно.
 */
export async function deletePinComment(
  params: {
    id: string;
  }
): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: DeleteCommentToPinDocument,
      variables: params, // Передаем id
    });
    // Предполагаем, что мутация возвращает Boolean!
    return result.data?.deleteCommentToPin === true;
  } catch (error) {
    console.error(`Failed to delete pin comment ${params.id}:`, error);
    return false;
  }
}

/**
 * Получает список комментариев к Доске.
 * Дефолтные значения (limit = 10, offset = 0) управляются на бэкенде.
 *
 * @param params - Объект параметров.
 * @param params.boardId - ID доски (обязательный).
 * @param params.limit - (Опционально) Максимальное количество комментариев.
 * @param params.offset - (Опционально) Смещение.
 * @returns Массив комментариев или пустой массив.
 */
export async function getCommentsByBoard(
  params: {
    boardId: string;
    limit?: number;
    offset?: number;
  }
): Promise<CommentToBoard[]> {
  try {
    // Формируем переменные, включая только те, что переданы
    const variables: { boardId: string; limit?: number; offset?: number } = { boardId: params.boardId };

    if (params.limit !== undefined) {
      variables.limit = params.limit;
    }
    if (params.offset !== undefined) {
      variables.offset = params.offset;
    }

    const result = await apolloClient.query({
      query: GetCommentsByBoardIdDocument,
      variables,
    });
    return result.data?.commentsByBoard ?? [];
  } catch (error) {
    console.error(`Failed to fetch comments for Board ${params.boardId}:`, error);
    return [];
  }
}

/**
 * Добавляет новый комментарий к Доске.
 *
 * @param params - Содержит все поля для AddCommentToBoardInput.
 * @returns Созданный объект CommentToBoard или null.
 */
export async function addCommentToBoard(
  params: AddCommentToBoardInput
): Promise<CommentToBoard | null> {
  try {
    const result = await apolloClient.mutate({
      mutation: AddCommentToBoardDocument,
      variables: { input: params }, // Передаем весь объект в качестве 'input'
    });
    return result.data?.addCommentToBoard || null;
  } catch (error) {
    console.error('Failed to add comment to board:', error);
    return null;
  }
}

/**
 * Обновляет текст существующего комментария к Доске.
 *
 * @param params - Объект параметров.
 * @param params.id - ID комментария (обязательный).
 * @param params.message - Новый текст сообщения (обязательный).
 * @returns Обновленный объект CommentToBoard или null.
 */
export async function updateBoardComment(
  params: {
    id: string;
    message: string;
  }
): Promise<CommentToBoard | null> {
  try {
    const result = await apolloClient.mutate({
      mutation: UpdateCommentToBoardDocument,
      variables: params, // Передаем id и message
    });
    return result.data?.updateCommentToBoard || null;
  } catch (error) {
    console.error(`Failed to update board comment ${params.id}:`, error);
    return null;
  }
}

/**
 * Удаляет комментарий к Доске.
 *
 * @param params - Объект параметров.
 * @param params.id - ID комментария (обязательный).
 * @returns true, если удаление прошло успешно.
 */
export async function deleteBoardComment(
  params: {
    id: string;
  }
): Promise<boolean> {
  try {
    const result = await apolloClient.mutate({
      mutation: DeleteCommentToBoardDocument,
      variables: params, // Передаем id
    });
    // Предполагаем, что мутация возвращает Boolean!
    return result.data?.deleteCommentToBoard === true;
  } catch (error) {
    console.error(`Failed to delete board comment ${params.id}:`, error);
    return false;
  }
}