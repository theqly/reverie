import { apolloClient } from '@/api/apolloClient.ts';
import {
  GetBookmarkedBoardsByUserIdDocument,
  GetBookmarkedPinsByUserIdDocument,
  GetLikedBoardsByUserIdDocument,
  GetLikedPinsByUserIdDocument,
  GetOwnBoardsByUserIdDocument,
  GetPinsByUserIdDocument,
  GetUserByIdDocument,
  GetUserByNickTagDocument,
  UpdateUserDocument,
  type GetBookmarkedBoardsByUserIdQuery,
  type GetBookmarkedPinsByUserIdQuery,
  type GetLikedBoardsByUserIdQuery,
  type GetLikedPinsByUserIdQuery,
  type GetOwnBoardsByUserIdQuery,
  type GetPinsByUserIdQuery,
  type GetUserByIdQuery,
  type GetUserByNickTagQuery,
  type UpdateUserInput,
  type UpdateUserMutation,
} from '@/graphql/generated/graphql.ts';

type UserIdentifier = { userId: string; nickTag?: never } | { nickTag: string; userId?: never };
type UserLookup = { id: string; nickTag?: never } | { nickTag: string; id?: never };
type Paging = { limit?: number; offset?: number };
type PinLookupParams = UserIdentifier & Paging & { viewerId?: string };
type BoardLookupParams = UserIdentifier & Paging;
type ReactionLookupParams = UserIdentifier & {
  pinsLimit?: number;
  pinsOffset?: number;
  boardsLimit?: number;
  boardsOffset?: number;
};

type UserPins = NonNullable<GetPinsByUserIdQuery['pinsByUser']>;
type UserBoards = GetOwnBoardsByUserIdQuery['ownBoardsByUser'];
type LikedPins = GetLikedPinsByUserIdQuery['likedPinsByUser'];
type LikedBoards = GetLikedBoardsByUserIdQuery['likedBoardsByUser'];
type BookmarkedPins = GetBookmarkedPinsByUserIdQuery['bookmarkedPinsByUser'];
type BookmarkedBoards = GetBookmarkedBoardsByUserIdQuery['bookmarkedBoardsByUser'];
type FoundUser = NonNullable<GetUserByIdQuery['userById']>;
type UpdatedUser = UpdateUserMutation['updateUser'];

export async function resolveUserId(params: { userId?: string; nickTag?: string }): Promise<string | null> {
  if (Boolean(params.userId) === Boolean(params.nickTag)) {
    throw new Error('Specify exactly one of userId or nickTag');
  }
  if (params.userId) return params.userId;
  return getUserIdByNickTag(params.nickTag!);
}

export async function findUser(userInfo: UserLookup): Promise<FoundUser | null> {
  if (userInfo.id) {
    const result = await apolloClient.query({
      query: GetUserByIdDocument,
      variables: { userId: userInfo.id },
    });
    return result.data?.userById ?? null;
  }
  if (userInfo.nickTag) {
    const result = await apolloClient.query({
      query: GetUserByNickTagDocument,
      variables: { nickTag: userInfo.nickTag },
    });
    // Both queries currently select the same user fields.
    const user: NonNullable<GetUserByNickTagQuery['userByTag']> | null = result.data?.userByTag ?? null;
    return user;
  }
  throw new Error('Specify an id or nickTag');
}

export async function getUserIdByNickTag(nickTag: string): Promise<string | null> {
  const result = await apolloClient.query({
    query: GetUserByNickTagDocument,
    variables: { nickTag },
  });
  return result.data?.userByTag?.id ?? null;
}

export async function getPinsByUser(params: PinLookupParams): Promise<UserPins | null> {
  const userId = await resolveUserId(params);
  if (!userId) return null;

  const result = await apolloClient.query({
    query: GetPinsByUserIdDocument,
    variables: {
      userId,
      viewerId: params.viewerId,
      limit: params.limit,
      offset: params.offset,
    },
  });
  return result.data?.pinsByUser ?? null;
}

export async function getOwnBoardsByUser(params: BoardLookupParams): Promise<UserBoards | null> {
  const userId = await resolveUserId(params);
  if (!userId) return null;

  const result = await apolloClient.query({
    query: GetOwnBoardsByUserIdDocument,
    variables: { userId, limit: params.limit, offset: params.offset },
  });
  return result.data?.ownBoardsByUser ?? null;
}

export async function getLikesByUser(
  params: ReactionLookupParams,
): Promise<{ pins: LikedPins; boards: LikedBoards } | null> {
  const userId = await resolveUserId(params);
  if (!userId) return null;

  const [pinsResult, boardsResult] = await Promise.all([
    apolloClient.query({
      query: GetLikedPinsByUserIdDocument,
      variables: { userID: userId, limit: params.pinsLimit, offset: params.pinsOffset },
    }),
    apolloClient.query({
      query: GetLikedBoardsByUserIdDocument,
      variables: { userID: userId, limit: params.boardsLimit, offset: params.boardsOffset },
    }),
  ]);

  return {
    pins: pinsResult.data?.likedPinsByUser ?? [],
    boards: boardsResult.data?.likedBoardsByUser ?? [],
  };
}

export async function getBookmarksByUser(
  params: ReactionLookupParams,
): Promise<{ pins: BookmarkedPins; boards: BookmarkedBoards } | null> {
  const userId = await resolveUserId(params);
  if (!userId) return null;

  const [pinsResult, boardsResult] = await Promise.all([
    apolloClient.query({
      query: GetBookmarkedPinsByUserIdDocument,
      variables: { userID: userId, limit: params.pinsLimit, offset: params.pinsOffset },
    }),
    apolloClient.query({
      query: GetBookmarkedBoardsByUserIdDocument,
      variables: { userID: userId, limit: params.boardsLimit, offset: params.boardsOffset },
    }),
  ]);

  return {
    pins: pinsResult.data?.bookmarkedPinsByUser ?? [],
    boards: boardsResult.data?.bookmarkedBoardsByUser ?? [],
  };
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<UpdatedUser | null> {
  const result = await apolloClient.mutate({
    mutation: UpdateUserDocument,
    variables: { userId, input },
  });
  return result.data?.updateUser ?? null;
}
