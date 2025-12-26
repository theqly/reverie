import {apolloClient} from "@/api/apolloClient.ts";
import {
  AddPinToBoardDocument,
} from "@/graphql/generated/graphql.ts";

/**
 * Добавляет пин на доску (в подборку).
 * Возвращает объект подборки // TODO: уточнить нужные возвращаемые поля
 * Или null в случае ошибки
 */
export async function addPinToBoard(pinId: string, boardId: string): Promise<string | null> {

  if (pinId === undefined || boardId === undefined) {
    console.warn("addPinToBoard: You must provide pinId and boardId.");
    return null;
  }

  const boardResult = await apolloClient.mutate({
    mutation: AddPinToBoardDocument,
    variables: {
      pinId: pinId,
      boardId: boardId
    }
  });

  return boardResult.data?.addPinToBoard || null;
}