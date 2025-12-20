import {apolloClient} from "@/api/apolloClient.ts";
import {
  AccessLevelType,
  type Board,
  CreateBoardDocument,
  type CreateBoardInput,
  CreateGroupDocument,
  type CreateGroupInput, GetBoardByIdDocument,
  OwnerType,
  UpdateBoardDocument,
  type UpdateBoardInput
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
 *   collaborators: ["Alice", "Bob"] // TODO: заменить на массив id. Сейчас чтоб хотя бы как-то работало есть строка 38
 * });
 */
export async function createCollection(payload: CreateCollectionPayload) {
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

/**
 * Обновляет подборку с заданным ID
 *
 * @param {string} collectionId - ID обновляемой подборки
 * @param {UpdateBoardInput} input - Данные подборки, которые нужно отправить.
 *
 * @example
 * await updateCollection(
 * "00000000-0000-0000-0000-000000000002",
 * {
 *   name: "Моя подборка",
 *   description: "Описание",
 *   ownerId: "00000000-0000-0000-0000-000000000001",
 * });
 */
export async function updateCollection(collectionId: string, input: UpdateBoardInput) : Promise< Board | null > {

  const updateInput: any = {
    userId: input.userId,
  };

  if (input.accessLevel !== undefined) {
    updateInput.accessLevel = input.accessLevel;
  }

  if (input.name !== undefined) {
    updateInput.name = input.name;
  }

  if (input.description !== undefined) {
    updateInput.description = input.description;
  }

  const updatedBoardResult = await apolloClient.mutate({
    mutation: UpdateBoardDocument,
    variables: {
      id: collectionId,
      input: updateInput as UpdateBoardInput
    },
  });

  return updatedBoardResult.data?.updateBoard || null;
}

/**
 * Получает подборку по её ID
 * @returns Board или null
 */
export async function getPinById(id: string): Promise<Board | null> {
  try {
    const result = await apolloClient.query({
      query: GetBoardByIdDocument,
       variables: { id },
    });
    return result.data?.board?? null;
  } catch (error) {
    console.error('Failed to fetch board:', error);
    return null;
  }
}
