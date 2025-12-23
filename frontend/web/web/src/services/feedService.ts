import { apolloClient } from "@/api/apolloClient.ts";
import {
  GetFeedPinsDocument,
  GetFeedBoardsDocument,
} from "@/graphql/generated/graphql.ts";

export interface FeedPin {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  createdAt?: string;
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
}

export interface FeedBoard {
  id: string;
  name: string;
  ownerId: string;
  ownerType?: string;
  accessLevel?: string;
  createdAt?: string;
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  pinIds?: string[];
}

/**
 * Получает ленту пинов для пользователя (пины от подписок)
 */
export async function getFeedPins(userId: string): Promise<FeedPin[]> {
  try {
    const result = await apolloClient.query({
      query: GetFeedPinsDocument,
      variables: { userID: userId },
      fetchPolicy: 'network-only',
    });

    const feedPins = result.data?.feedPins || [];

    // Преобразуем snake_case в camelCase
    return feedPins.map((pin: Record<string, unknown>) => ({
      id: pin.pin_id,
      name: pin.name,
      ownerId: pin.owner_id,
      description: pin.description,
      latitude: pin.latitude,
      longitude: pin.longitude,
      rating: pin.rating,
      createdAt: pin.created_at,
      likesCount: pin.likes_count,
      commentsCount: pin.comments_count,
      bookmarksCount: pin.bookmarks_count,
    }));
  } catch (error) {
    console.error('[FeedService] getFeedPins error:', error);
    return [];
  }
}

/**
 * Получает ленту подборок для пользователя (подборки от подписок)
 */
export async function getFeedBoards(userId: string): Promise<FeedBoard[]> {
  try {
    const result = await apolloClient.query({
      query: GetFeedBoardsDocument,
      variables: { userID: userId },
      fetchPolicy: 'network-only',
    });

    const feedBoards = result.data?.feedBoards || [];

    // Преобразуем snake_case в camelCase
    return feedBoards.map((board: Record<string, unknown>) => ({
      id: board.board_id,
      name: board.name,
      ownerId: board.owner_id,
      ownerType: board.owner_type,
      accessLevel: board.access_level,
      createdAt: board.created_at,
      likesCount: board.likes_count,
      commentsCount: board.comments_count,
      bookmarksCount: board.bookmarks_count,
      pinIds: board.pin_ids,
    }));
  } catch (error) {
    console.error('[FeedService] getFeedBoards error:', error);
    return [];
  }
}
