
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback  } from 'react';

import Header from '../../pages/Header';
import styles from '../pins/PinViewPage.module.css';
import placeholder_1 from '../../assets/placeholder1.jpg';

import ReactionBlock from '../../pages/ReactionBlock';
import PinGrid from '../../features/pins/components/PinGrid';
import { getBookmarkedBoardsByUser } from '../../services/bookmarksService';
import { apolloClient } from '@/api/apolloClient';

import {
  GetLikedBoardIdsByUserIdDocument,
  GetBookmarkedBoardIdsByUserIdDocument,
} from '@/graphql/generated/graphql';

import {
  getBoardById,
  isBoardLiked,
  isBoardBookmarked,
} from '../../services/collectionsService';

import {
  countReactionsToBoard,
  reactToBoard,
} from '../../services/reactionsService';

import { toggleBookmarkToBoard } from '../../services/bookmarksService';

import type {
  GetBoardByIdQuery,
} from '@/graphql/generated/graphql';

type BoardData = NonNullable<GetBoardByIdQuery['board']>;
type BoardPin = NonNullable<BoardData['pins']>[number];

const LIKE_REACTION_ID = '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f';
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();

  const [collection, setCollection] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reactionPending, setReactionPending] = useState(false);

  // Загрузка подборки через GraphQL
  useEffect(() => {
    if (!collectionId) {
      setCollection(null);
      setError('ID подборки не указан');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCollection = async () => {
      setLoading(true);
      setError(null);
      setCollection(null);

      try {
        const board = await getBoardById(collectionId);

        if (cancelled) return;

        if (!board) {
          setError(`Подборка с ID ${collectionId} не найдена`);
          return;
        }

        setCollection(board);
      } catch (err) {
        if (cancelled) return;

        console.error('[CollectionViewPage] Load error:', err);
        setError('Не удалось загрузить подборку');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCollection();

    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  
  //не используется потому что авторизация по токену не работает пока что
  /*useEffect(() => {
    if (!collectionId) return;

    let cancelled = false;

    setLiked(false);
    setBookmarked(false);
    setLikesCount(0);

    const loadReactions = async () => {
      const [likedResult, bookmarkedResult, countResult] =
        await Promise.allSettled([
          isBoardLiked(collectionId),
          isBoardBookmarked(collectionId),
          countReactionsToBoard({ boardId: collectionId }),
        ]);

      if (cancelled) return;

      if (likedResult.status === 'fulfilled') {
        setLiked(likedResult.value);
      } else {
        console.error('Failed to load liked status', likedResult.reason);
      }

      if (bookmarkedResult.status === 'fulfilled') {
        setBookmarked(bookmarkedResult.value);
      } else {
        console.error(
          'Failed to load bookmarked status',
          bookmarkedResult.reason,
        );
      }

      if (countResult.status === 'fulfilled') {
        const count = countResult.value;

        if (typeof count === 'number' && Number.isFinite(count) && count >= 0) {
          setLikesCount(count);
        }
      } else {
        console.error('Failed to load reactions count', countResult.reason);
      }
    };

    void loadReactions();

    return () => {
      cancelled = true;
    };
  }, [collectionId]);*/

  const refreshReactions = useCallback(async () => {
    if (!collectionId) return;

    const [likesResult, bookmarksResult, count] = await Promise.all([
      apolloClient.query({
        query: GetLikedBoardIdsByUserIdDocument,
        variables: {
          userID: TEMP_USER_ID,
          limit: 100,
          offset: 0,
        },
        fetchPolicy: 'network-only',
      }),

      apolloClient.query({
        query: GetBookmarkedBoardIdsByUserIdDocument,
        variables: {
          userID: TEMP_USER_ID,
          limit: 100,
          offset: 0,
        },
        fetchPolicy: 'network-only',
      }),

      countReactionsToBoard({ boardId: collectionId }),
    ]);
    

    const likedBoards = likesResult.data?.likedBoardsByUser ?? [];
    const bookmarkedBoards = bookmarksResult.data?.bookmarkedBoardsByUser ?? [];

    setLiked(likedBoards.some((board) => board.id === collectionId));

    setBookmarked(
      bookmarkedBoards.some((board) => board.id === collectionId),
    );

    setLikesCount(count);
  }, [collectionId]);
    
  useEffect(() => { //временно, потом заменить
    void refreshReactions();
  }, [refreshReactions]);


  const handleLike = async (_nextLiked: boolean) => {
    if (!collectionId || reactionPending) return;

    setReactionPending(true);

    try {
      await reactToBoard({
        boardId: collectionId,
        reactionId: LIKE_REACTION_ID,
        userId: TEMP_USER_ID,
      });

      await refreshReactions();
    } catch (err) {
      console.error('Failed to toggle board reaction', err);
    } finally {
      setReactionPending(false);
    }
  };

  const handleBookmark = async (_nextBookmarked: boolean) => {
    if (!collectionId || reactionPending) return;

    setReactionPending(true);

    try {
      await toggleBookmarkToBoard({
        boardId: collectionId,
        userId: TEMP_USER_ID,
      });
      const boards = await getBookmarkedBoardsByUser({
        userId: TEMP_USER_ID,
      });

      console.log('[Bookmark] User boards:', boards);
      console.log(
        '[Bookmark] Current board bookmarked:',
        boards?.some((board) => board.id === collectionId),
      );

      await refreshReactions();
    } catch (err) {
      console.error('Failed to toggle board bookmark', err);
    } finally {
      setReactionPending(false);
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className={styles.pageWrapper}>
        <Header />

        <div className={styles.errorContainer}>
          <h2>Не удалось открыть подборку</h2>
          <p>{error ?? 'Данные подборки отсутствуют'}</p>

          <button
            onClick={() => navigate('/feed')}
            className={styles.backButton}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const collectionPins: BoardPin[] = collection.pins ?? [];

  // Временное представление для старого PinGridItem.
  // После его типизации этот map можно будет убрать.
  const displayPins = collectionPins.map((pin) => ({
    id: pin.id,
    title: pin.name,
    image: pin.images?.[0]?.imageUrl ?? placeholder_1,
    location: '',
    author: 'Автор неизвестен',
    authorAvatar: placeholder_1,
  }));

  const collectionImage =
    collectionPins
      .flatMap((pin) => pin.images ?? [])
      .sort((a, b) => a.orderNumber - b.orderNumber)[0]
      ?.imageUrl ?? placeholder_1;

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button
              onClick={handleBack}
              className={styles.back_btn}
              aria-label="Назад"
            />

            <h2>Подборка</h2>

            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/collection/edit/${collectionId}`)}
              aria-label="Редактировать подборку"
            />
          </div>

          <div className={styles.pinCard}>
            <img
              src={collectionImage}
              alt={collection.name}
              className={styles.collectionImage}
            />

            <h3 className={styles.pinTitle}>
              {collection.name}
            </h3>

            <p className={styles.pinDescription}>
              {collection.description ?? ''}
            </p>

            <ReactionBlock
              initialLikes={likesCount}
              initialLiked={liked}
              initialBookmarked={bookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
              disabled={reactionPending}
            />
          </div>

          <h3 className={styles.pinsTitle}>
            Места в подборке ({collectionPins.length})
          </h3>

          <div className={styles.pinsWrapper}>
            {displayPins.length > 0 ? (
              <PinGrid
                pins={displayPins}
                onPinClick={(pinId: string) =>
                  navigate(`/pin/${pinId}`)
                }
              />
            ) : (
              <p>В подборке пока нет пинов</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionViewPage;
