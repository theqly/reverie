
import { apolloClient } from '@/api/apolloClient.ts';

import {
  AccessLevelType,
  CreateBoardDocument,
  CreateGroupDocument,
  GetBoardByIdDocument,
  GetBoardReactionIdDocument,
  IsBoardBookmarkedDocument,
  OwnerType,
  UpdateBoardDocument,
  type GetBoardByIdQuery,
  type CreateBoardMutation,
  type UpdateBoardMutation,
  type UpdateBoardInput,
} from '@/graphql/generated/graphql.ts';

import {
  uploadImageDev,
  type ImageUploadProgress,
} from '@/services/imageService.ts';

export interface CreateCollectionPayload {
  name: string;
  info: string;
  coverImage: File | null;
  collaborators: string[];
}

type CreatedBoard = NonNullable<CreateBoardMutation['createBoard']>;
type UpdatedBoard = NonNullable<UpdateBoardMutation['updateBoard']>;
type BoardById = NonNullable<GetBoardByIdQuery['board']>;

export interface CreateCollectionResult {
  success: boolean;
  boardId?: string;
  board?: CreatedBoard;
  coverImageUrl?: string;
  error?: string;
}

/**
 * Создаёт новую подборку и при наличии изображения
 * загружает её обложку.
 */
export async function createCollection(
  payload: CreateCollectionPayload,
  onImageProgress?: (progress: ImageUploadProgress) => void,
): Promise<CreateCollectionResult> {
  if (payload.collaborators.length === 0) {
    return {
      success: false,
      error: 'Не указаны участники подборки',
    };
  }

  let coverImageUrl: string | undefined;

  try {
    // Загружаем обложку, если пользователь выбрал файл.
    if (payload.coverImage) {
      const uploadResult = await uploadImageDev(
        payload.coverImage,
        onImageProgress,
      );

      if (uploadResult.success && uploadResult.imageUrl) {
        coverImageUrl = uploadResult.imageUrl;
      } else {
        console.warn(
          '[createCollection] Failed to upload cover image:',
          uploadResult.error,
        );
      }
    }

    // Если участников несколько, создаём групповую подборку.
    if (payload.collaborators.length > 1) {
      const groupResult = await apolloClient.mutate({
        mutation: CreateGroupDocument,
        variables: {
          input: {
            members: payload.collaborators,
          },
        },
      });

      const newGroupId = groupResult.data?.createGroup?.id;

      if (!newGroupId) {
        throw new Error('Не удалось создать группу');
      }

      const boardResult = await apolloClient.mutate({
        mutation: CreateBoardDocument,
        variables: {
          input: {
            name: payload.name,
            description: payload.info,
            boardImageURL: coverImageUrl,
            accessLevel: AccessLevelType.Group,
            ownerId: newGroupId,
            ownerType: OwnerType.Group,
          },
        },
      });

      const newBoard = boardResult.data?.createBoard;

      if (!newBoard) {
        throw new Error('Не удалось создать подборку');
      }

      return {
        success: true,
        boardId: newBoard.id,
        board: newBoard,
        coverImageUrl,
      };
    }

    // Если участник один, создаём личную подборку.
    const boardResult = await apolloClient.mutate({
      mutation: CreateBoardDocument,
      variables: {
        input: {
          name: payload.name,
          description: payload.info,
          boardImageURL: coverImageUrl,
          accessLevel: AccessLevelType.Public,
          ownerId: payload.collaborators[0],
          ownerType: OwnerType.User,
        },
      },
    });

    const newBoard = boardResult.data?.createBoard;

    if (!newBoard) {
      throw new Error('Не удалось создать подборку');
    }

    return {
      success: true,
      boardId: newBoard.id,
      board: newBoard,
      coverImageUrl,
    };
  } catch (error: unknown) {
    console.error('[createCollection] Failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Обновляет существующую подборку.
 */
export async function updateCollection(
  collectionId: string,
  input: UpdateBoardInput,
): Promise<UpdatedBoard | null> {
  const updateInput: UpdateBoardInput = {
    userId: input.userId,
    accessLevel: input.accessLevel,
    name: input.name,
    description: input.description,
  };

  const result = await apolloClient.mutate({
    mutation: UpdateBoardDocument,
    variables: {
      id: collectionId,
      input: updateInput,
    },
  });

  return result.data?.updateBoard ?? null;
}

/**
 * Получает подборку по её ID.
 */
export async function getBoardById(
  id: string,
): Promise<BoardById | null> {
  try {
    const result = await apolloClient.query({
      query: GetBoardByIdDocument,
      variables: { id },
    });

    return result.data?.board ?? null;
  } catch (error: unknown) {
    console.error('[getBoardById] Failed:', error);
    return null;
  }
}

/**
 * Проверяет реакцию на подборке.
 *
 * Для актуальной JWT-интеграции необходимо проверить,
 * как сервер определяет пользователя.
 */
export async function isBoardLiked(
  id: string,
): Promise<boolean> {
  const result = await apolloClient.query({
    query: GetBoardReactionIdDocument,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  return (
    result.data?.board?.reactionId ===
    '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f'
  );
}

/**
 * Проверяет, добавлена ли подборка в закладки.
 */
export async function isBoardBookmarked(
  id: string,
): Promise<boolean> {
  const result = await apolloClient.query({
    query: IsBoardBookmarkedDocument,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  return result.data?.board?.bookmarked ?? false;
}
