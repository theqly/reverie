import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';

import Header from '../../pages/Header';
import MapPicker from '../map/MapPicker';
import ReactionBlock from '../../pages/ReactionBlock';

import styles from './PinViewPage.module.css';
import placeholder_1 from '../../assets/placeholder1.jpg';

import { apolloClient } from '@/api/apolloClient';
import {
  GetLikedPinIdsByUserIdDocument,
  GetBookmarkedPinIdsByUserIdDocument,
} from '@/graphql/generated/graphql';

import { getPinById } from '../../services/pinService';
import {
  countReactionsToPin,
  reactToPin,
} from '../../services/reactionsService';
import { toggleBookmarkToPin } from '../../services/bookmarksService';

type PinData = NonNullable<Awaited<ReturnType<typeof getPinById>>>;

// TODO(auth): заменить на ID пользователя из авторизованной сессии.
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';
const LIKE_REACTION_ID = '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f';

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams<{ pinId: string }>();

  const [pin, setPin] = useState<PinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reactionsLoading, setReactionsLoading] = useState(true);
  const [reactionPending, setReactionPending] = useState(false);

  // Не допускаем двойное нажатие до следующего React-render.
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!pinId) {
      setPin(null);
      setError('ID пина не указан');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadPin = async () => {
      setLoading(true);
      setError(null);
      setPin(null);

      try {
        const result = await getPinById(pinId);
        if (cancelled) return;

        if (!result) {
          setError(`Пин с ID ${pinId} не найден`);
          return;
        }

        setPin(result);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('[PinViewPage] Failed to load pin:', err);
        setError('Не удалось загрузить пин');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPin();

    return () => {
      cancelled = true;
    };
  }, [pinId]);

  const refreshReactions = useCallback(async (isCancelled?: () => boolean) => {
    if (!pinId) return;

    const [likedResult, bookmarkedResult, countResult] = await Promise.allSettled([
      apolloClient.query({
        query: GetLikedPinIdsByUserIdDocument,
        variables: { userID: TEMP_USER_ID, limit: 100, offset: 0 },
        fetchPolicy: 'network-only',
      }),
      apolloClient.query({
        query: GetBookmarkedPinIdsByUserIdDocument,
        variables: { userID: TEMP_USER_ID, limit: 100, offset: 0 },
        fetchPolicy: 'network-only',
      }),
      countReactionsToPin({ pinId }),
    ]);

    if (isCancelled?.()) return;

    if (likedResult.status === 'fulfilled') {
      const pins = likedResult.value.data?.likedPinsByUser ?? [];
      setLiked(pins.some((item) => item.id === pinId));
    } else {
      console.error('[PinViewPage] Failed to load liked pins:', likedResult.reason);
    }

    if (bookmarkedResult.status === 'fulfilled') {
      const pins = bookmarkedResult.value.data?.bookmarkedPinsByUser ?? [];
      setBookmarked(pins.some((item) => item.id === pinId));
    } else {
      console.error('[PinViewPage] Failed to load bookmarked pins:', bookmarkedResult.reason);
    }

    if (countResult.status === 'fulfilled') {
      const count = countResult.value;
      if (Number.isFinite(count) && count >= 0) setLikesCount(count);
    } else {
      console.error('[PinViewPage] Failed to load reactions count:', countResult.reason);
    }
  }, [pinId]);

  useEffect(() => {
    if (!pinId) {
      setReactionsLoading(false);
      return;
    }

    let cancelled = false;
    setReactionsLoading(true);
    setLiked(false);
    setBookmarked(false);
    setLikesCount(0);

    void refreshReactions(() => cancelled)
      .catch((err: unknown) => {
        if (!cancelled) console.error('[PinViewPage] Reaction loading failed:', err);
      })
      .finally(() => {
        if (!cancelled) setReactionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pinId, refreshReactions]);

  const handleLike = async (_nextLiked: boolean) => {
    if (!pinId || pendingRef.current) return;
    pendingRef.current = true;
    setReactionPending(true);

    try {
      // По API это toggle. Boolean-ответ не используем как состояние лайка.
      const ok = await reactToPin({
        pinId,
        reactionId: LIKE_REACTION_ID,
        userId: TEMP_USER_ID,
      });
      if (!ok) throw new Error('reactionToPin returned false');
      await refreshReactions();
    } catch (err: unknown) {
      console.error('[PinViewPage] Failed to toggle like:', err);
    } finally {
      pendingRef.current = false;
      setReactionPending(false);
    }
  };

  const handleBookmark = async (_nextBookmarked: boolean) => {
    if (!pinId || pendingRef.current) return;
    pendingRef.current = true;
    setReactionPending(true);

    try {
      const ok = await toggleBookmarkToPin({
        pinId,
        userId: TEMP_USER_ID,
      });
      if (!ok) throw new Error('bookmarkToPin returned false');
      await refreshReactions();
    } catch (err: unknown) {
      console.error('[PinViewPage] Failed to toggle bookmark:', err);
    } finally {
      pendingRef.current = false;
      setReactionPending(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loading}>Загрузка пина...</div>
      </div>
    );
  }

  if (error || !pin) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Не удалось открыть пин</h2>
          <p>{error ?? 'Данные пина отсутствуют'}</p>
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className={styles.backButton}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const pinImage = pin.images?.[0]?.imageUrl ?? placeholder_1;

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.back_btn}
              aria-label="Назад"
            />
            <h2>Просмотр пина</h2>
            <button
              type="button"
              className={styles.settingsBtn}
              onClick={() => navigate(`/pin/edit/${pinId}`)}
              aria-label="Редактировать пин"
            />
          </div>

          <div className={styles.pinCardWrapper}>
            <div className={styles.pinCard}>
              <img src={pinImage} alt={pin.name} className={styles.img1} />
              <h3 className={styles.pinTitle}>{pin.name}</h3>
              <p className={styles.collectionLocation}>
                Широта: {pin.latitude}, Долгота: {pin.longitude}
              </p>
              <p className={styles.pinDescription}>{pin.description ?? ''}</p>

              {!reactionsLoading && (
                <ReactionBlock
                  initialLikes={likesCount}
                  initialLiked={liked}
                  initialBookmarked={bookmarked}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  disabled={reactionPending}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.mapWrapperFixed}>
          <MapPicker
            key={pin.id}
            initialCoords={[pin.latitude, pin.longitude]}
            onSelect={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default PinViewPage;
