import {apolloClient} from "@/api/apolloClient.ts";
import {
  GetUserByIdDocument,
  GetUserByNickTagDocument,
  type User
} from "@/graphql/generated/graphql.ts";

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
          id: userInfo.id
        }
      });
      return userResult.data?.userById || null
    } else if (userInfo.nickTag != null) {
      const userResult = await apolloClient.query({
        query: GetUserByNickTagDocument,
        variables: {
          nickname: userInfo.nickTag
        }
      });
      return userResult.data?.userById || null
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to find user by nickname:', error);
  }
  return null;
}

