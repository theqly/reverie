import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Header from '../../pages/Header';
import ReactionBlock from '../../pages/ReactionBlock';
import MapShower from '../map/MapShowBoard';
import PinGrid from '../../features/pins/components/PinGrid';
import styles from '../pins/PinViewPage.module.css';
import placeholder from '../../assets/placeholder1.jpg';

import { getUserIdFromToken } from '../../auth/tokenStorage';
import { findUser } from '../../services/profileService';
import { getBoardById } from '../../services/collectionsService';
import { getPinById } from '../../services/pinService';
import { countReactionsToBoard, reactToBoard } from '../../services/reactionsService';
import { toggleBookmarkToBoard } from '../../services/bookmarksService';
import { apolloClient } from '@/api/apolloClient';
import {
  GetLikedBoardIdsByUserIdDocument,
  GetBookmarkedBoardIdsByUserIdDocument,
  OwnerType,
} from '@/graphql/generated/graphql';

type BoardData = NonNullable<Awaited<ReturnType<typeof getBoardById>>>;
type PinData = NonNullable<Awaited<ReturnType<typeof getPinById>>>;

type DisplayPin = {
  id: string;
  title: string;
  image: string;
  location: string;
  author: string;
  authorAvatar: string;
};

type MapPin = {
  id: string;
  coordinates: [number, number];
  title: string;
  description: string;
  image: string;
};

const LIKE_REACTION_ID = '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f';

// Совместимость с переходным периодом схемы: поле boardImageURL
// должно присутствовать в GraphQL selection set, иначе его не будет в ответе.
function boardCoverUrl(board: BoardData): string | undefined {
  if ('boardImageURL' in board && typeof board.boardImageURL === 'string') {
    return board.boardImageURL;
  }
  return undefined;
}

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();
  const currentUserId = getUserIdFromToken();

  const [collection, setCollection] = useState<BoardData | null>(null);
  const [pinDetails, setPinDetails] = useState<Map<string, PinData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<{ nickname: string; avatar: string } | null>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reactionPending, setReactionPending] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!collectionId) {
      setCollection(null);
      setError('ID подборки не указан');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setCollection(null);
    setPinDetails(new Map());

    const load = async () => {
      try {
        const board = await getBoardById(collectionId);
        if (cancelled) return;
        if (!board) {
          setError('Подборка не найдена');
          return;
        }
        setCollection(board);

        // В GetBoardById пины могут приходить без координат.
        // Запрашиваем полные данные для карты, не задерживая показ самой подборки.
        const pinIds = (board.pins ?? []).map((pin) => pin.id);
        if (pinIds.length > 0) {
          void Promise.allSettled(pinIds.map((id) => getPinById(id))).then((results) => {
            if (cancelled) return;
            const details = new Map<string, PinData>();
            results.forEach((result, index) => {
              if (result.status === 'fulfilled' && result.value) {
                details.set(pinIds[index], result.value);
              }
            });
            setPinDetails(details);
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('[CollectionViewPage] load failed:', err);
          setError('Не удалось загрузить подборку');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [collectionId]);

  useEffect(() => {
    setOwner(null);
    if (!collection || collection.ownerType !== OwnerType.User) return;
    let cancelled = false;
    void findUser({ id: collection.ownerId })
      .then((user) => {
        if (!cancelled && user) {
          setOwner({
            nickname: user.nickTag || user.nickname || 'Пользователь',
            avatar: user.profilePicture || placeholder,
          });
        }
      })
      .catch((err) => console.warn('[CollectionViewPage] owner:', err));
    return () => { cancelled = true; };
  }, [collection]);

  const refreshReactions = useCallback(async (isCancelled?: () => boolean) => {
    if (!collectionId) return;
    const countPromise = countReactionsToBoard({ boardId: collectionId });

    if (!currentUserId) {
      const count = await countPromise;
      if (!isCancelled?.()) setLikesCount(count);
      return;
    }

    const [likes, bookmarks, count] = await Promise.all([
      apolloClient.query({
        query: GetLikedBoardIdsByUserIdDocument,
        variables: { userID: currentUserId, limit: 100, offset: 0 },
        fetchPolicy: 'network-only',
      }),
      apolloClient.query({
        query: GetBookmarkedBoardIdsByUserIdDocument,
        variables: { userID: currentUserId, limit: 100, offset: 0 },
        fetchPolicy: 'network-only',
      }),
      countPromise,
    ]);

    if (isCancelled?.()) return;
    setLiked((likes.data?.likedBoardsByUser ?? []).some((b) => b.id === collectionId));
    setBookmarked((bookmarks.data?.bookmarkedBoardsByUser ?? []).some((b) => b.id === collectionId));
    setLikesCount(count);
  }, [collectionId, currentUserId]);

  useEffect(() => {
    let cancelled = false;
    setLiked(false);
    setBookmarked(false);
    setLikesCount(0);
    void refreshReactions(() => cancelled).catch((err) => {
      if (!cancelled) console.error('[CollectionViewPage] reactions:', err);
    });
    return () => { cancelled = true; };
  }, [refreshReactions]);

  const handleLike = async (_nextLiked: boolean) => {
    if (!collectionId || !currentUserId || pendingRef.current) return;
    pendingRef.current = true;
    setReactionPending(true);
    try {
      await reactToBoard({
        boardId: collectionId,
        reactionId: LIKE_REACTION_ID,
        userId: currentUserId,
      });
      await refreshReactions();
    } catch (err) {
      console.error('[CollectionViewPage] toggle like:', err);
    } finally {
      pendingRef.current = false;
      setReactionPending(false);
    }
  };

  const handleBookmark = async (_nextBookmarked: boolean) => {
    if (!collectionId || !currentUserId || pendingRef.current) return;
    pendingRef.current = true;
    setReactionPending(true);
    try {
      await toggleBookmarkToBoard({
        boardId: collectionId,
        userId: currentUserId,
      });
      await refreshReactions();
    } catch (err) {
      console.error('[CollectionViewPage] toggle bookmark:', err);
    } finally {
      pendingRef.current = false;
      setReactionPending(false);
    }
  };

  const boardPins = collection?.pins ?? [];
  const displayPins: DisplayPin[] = boardPins.map((pin) => {
    const full = pinDetails.get(pin.id);
    return {
      id: pin.id,
      title: pin.name,
      image: full?.images?.[0]?.imageUrl ?? pin.images?.[0]?.imageUrl ?? placeholder,
      location: full ? `${full.latitude}, ${full.longitude}` : '',
      author: 'Автор неизвестен',
      authorAvatar: placeholder,
    };
  });

  const pinsForMap: MapPin[] = useMemo(() => {
    return boardPins.flatMap((pin) => {
      const full = pinDetails.get(pin.id);
      if (!full || !Number.isFinite(full.latitude) || !Number.isFinite(full.longitude)) {
        return [];
      }
      return [{
        id: pin.id,
        coordinates: [full.latitude, full.longitude] as [number, number],
        title: full.name,
        description: full.description ?? '',
        image: full.images?.[0]?.imageUrl ?? placeholder,
      }];
    });
  }, [boardPins, pinDetails]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (pinsForMap.length === 0) return [55.7558, 37.6173];
    return [
      pinsForMap.reduce((sum, pin) => sum + pin.coordinates[0], 0) / pinsForMap.length,
      pinsForMap.reduce((sum, pin) => sum + pin.coordinates[1], 0) / pinsForMap.length,
    ];
  }, [pinsForMap]);

  if (loading) {
    return <div className={styles.pageWrapper}><Header /><div className={styles.loading}>Загрузка подборки...</div></div>;
  }

  if (error || !collection) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Не удалось открыть подборку</h2>
          <p>{error ?? 'Данные подборки отсутствуют'}</p>
          <button type="button" onClick={() => navigate('/feed')} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(currentUserId && collection.ownerId === currentUserId);
  const cover = boardCoverUrl(collection) ?? displayPins[0]?.image ?? placeholder;

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button type="button" onClick={() => navigate(-1)} className={styles.back_btn} aria-label="Назад" />
            <h2>
              Подборка{owner && collection.ownerType === OwnerType.User && (
                <> от <Link to={`/profile/${collection.ownerId}`} className={styles.authorA}>@{owner.nickname}</Link></>
              )}
            </h2>
            {isOwner && (
              <button
                type="button"
                className={styles.settingsBtn}
                onClick={() => navigate(`/collection/edit/${collectionId}`)}
                aria-label="Редактировать подборку"
              />
            )}
          </div>

          <div className={styles.pinCard}>
            <img src={cover} alt={collection.name} className={styles.img1} />
            <h3 className={styles.pinTitle}>{collection.name}</h3>
            <p className={styles.pinDescription}>{collection.description || 'Без описания'}</p>
            <ReactionBlock
              initialLikes={likesCount}
              initialLiked={liked}
              initialBookmarked={bookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
              disabled={!currentUserId || reactionPending}
            />
          </div>

          <h3 className={styles.pinsTitle}>Места в подборке ({boardPins.length})</h3>
          <div className={styles.pinsWrapper}>
            {displayPins.length > 0 ? (
              <PinGrid
                pins={displayPins}
                onPinClick={(pinId: string) => navigate(`/pin/${pinId}?from=collection/${collectionId}`)}
              />
            ) : (
              <p>В подборке пока нет пинов</p>
            )}
          </div>
        </div>

        <div className={styles.mapWrapperFixed}>
          {pinsForMap.length > 0 ? (
            <MapShower readOnly onSelect={() => {}} initialCoords={mapCenter} pins={pinsForMap} />
          ) : (
            <div className={styles.emptyMapPlaceholder}>
              <div className={styles.placeholderContent}>
                <p className={styles.placeholderText}>Когда тут будут пины с координатами, мы покажем их на карте</p>
                {isOwner && (
                  <button
                    type="button"
                    className={styles.addPinButton}
                    onClick={() => navigate(`/pin/create?collectionId=${collectionId}`)}
                  >
                    Добавить место
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionViewPage;
