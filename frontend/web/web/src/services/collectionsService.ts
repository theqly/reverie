// services/collectionsService.ts

import {apolloClient} from "@/api/apolloClient.ts";
import {
  AccessLevelType,
  CreateBoardDocument,
  type CreateBoardInput,
  CreateGroupDocument,
  type CreateGroupInput,
  OwnerType
} from "@/graphql/generated/graphql.ts";

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
 *   collaborators: ["Alice", "Bob"] // Тут стоит передавать их никнеймы уникальные (как юзернейм в тг, например) или UUID, не имена
 * });
 */
export async function createCollection(payload: CreateCollectionPayload) {
  // TODO: Реализовать на бэке
  if (payload.collaborators.length == 0) {
    return { success: false };
  }

  try {
    if (payload.collaborators.length > 1) {
      const groupResult = await apolloClient.mutate({
        mutation: CreateGroupDocument,
        variables: {
          input: {
            members: payload.collaborators
          } as CreateGroupInput
        }
      });

      const newGroupId = groupResult.data?.createGroup?.id;
      if (!newGroupId) {
        throw new Error('Failed to create group');
      }

      // Создать Board
      const boardResult = await apolloClient.mutate({
        mutation: CreateBoardDocument,
        variables: {
          input: {
            name: payload.name,
            accessLevel: AccessLevelType.Group,
            ownerId: newGroupId,
            ownerType: OwnerType.Group,
          } as CreateBoardInput
        },
        // refetchQueries: ['ownBoardsByUser', 'groupBoardsByUser']
      });

      const newBoard = boardResult.data?.createBoard;

      if (!newBoard) {
        throw new Error('Failed to create board');
      }

      return {
        success: true,
        boardId: newBoard.id,
        board: newBoard
      };
    } else {
      const boardResult = await apolloClient.mutate({
        mutation: CreateBoardDocument,
        variables: {
          input: {
            name: payload.name,
            accessLevel: AccessLevelType.Public,
            ownerId: payload.collaborators[0],
            ownerType: OwnerType.User,
          } as CreateBoardInput
        },
      });

      const newBoard = boardResult.data?.createBoard;

      if (!newBoard) {
        throw new Error('Failed to create board');
      }

      return {
        success: true,
        boardId: newBoard.id,
        board: newBoard
      };
    }

  } catch (error: any) {
    console.error('Error creating collection:', error);
    throw new Error(`Failed to create collection: ${error.message}`);
  }


}
