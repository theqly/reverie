import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Header from '../../pages/Header';
import ReactionBlock from '../../pages/ReactionBlock';
import MapPicker from '../map/MapPicker';
import styles from './PinViewPage.module.css';
import placeholder from '../../assets/placeholder1.jpg';

import { apolloClient } from '@/api/apolloClient';
import {
  GetLikedPinIdsByUserIdDocument,
  GetBookmarkedPinIdsByUserIdDocument,
} from '@/graphql/generated/graphql';
import { getUserIdFromToken } from '../../auth/tokenStorage';
import { useToast } from '../../pages/ToastContext';
import { getPinById } from '../../services/pinService';
import { findUser, getOwnBoardsByUser } from '../../services/profileService';
import { countReactionsToPin, reactToPin } from '../../services/reactionsService';
import { toggleBookmarkToPin } from '../../services/bookmarksService';
import { addPinToBoard } from '../../services/addPinToBoardService';

type PinData = NonNullable<Awaited<ReturnType<typeof getPinById>>>;
type CollectionOption = { id: string; name: string; description?: string | null };
type OwnerData = { nickname: string; profilePicture?: string | null };

const LIKE_REACTION_ID = '8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f';

// Не все версии GetPinById возвращают ownerId/owner.
// Наличие поля проверяется на runtime; для полноценного отображения владельца
// его необходимо включить в GraphQL selection set.
function getOwnerId(pin: PinData): string | null {
  const value: unknown = pin;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.ownerId === 'string') return record.ownerId;
  const owner = record.owner;
  if (owner && typeof owner === 'object') {
    const id = (owner as Record<string, unknown>).id;
    if (typeof id === 'string') return id;
  }
  return null;
}

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams<{ pinId: string }>();
  const { showToast } = useToast();
  const currentUserId = getUserIdFromToken();

  const [pin, setPin] = useState<PinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reactionsLoading, setReactionsLoading] = useState(true);
  const [reactionPending, setReactionPending] = useState(false);
  const pendingRef = useRef(false);

  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [errorCollections, setErrorCollections] = useState<string | null>(null);
  const [addingToBoard, setAddingToBoard] = useState(false);

  const ownerId = pin ? getOwnerId(pin) : null;
  const isPinOwner = Boolean(ownerId && currentUserId && ownerId === currentUserId);

  useEffect(() => {
    if (!pinId) {
      setPin(null);
      setError('ID пина не указан');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPin(null);
    void getPinById(pinId)
      .then((result) => {
        if (cancelled) return;
        if (result) setPin(result);
        else setError(`Пин с ID ${pinId} не найден`);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('[PinViewPage] Load failed:', err);
        setError('Не удалось загрузить пин');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pinId]);

  useEffect(() => {
    setOwnerData(null);
    if (!ownerId) return;
    let cancelled = false;
    setLoadingOwner(true);
    void findUser({ id: ownerId })
      .then((user) => {
        if (!cancelled && user) {
          setOwnerData({
            nickname: user.nickname || user.nickTag || 'Пользователь',
            profilePicture: user.profilePicture,
          });
        }
      })
      .catch((err: unknown) => console.error('[PinViewPage] Owner load failed:', err))
      .finally(() => { if (!cancelled) setLoadingOwner(false); });
    return () => { cancelled = true; };
  }, [ownerId]);

  const refreshReactions = useCallback(async (cancelled?: () => boolean) => {
    if (!pinId) return;
    const userId = getUserIdFromToken();
    const results = await Promise.allSettled([
      userId ? apolloClient.query({
        query: GetLikedPinIdsByUserIdDocument,
        variables: { userID: userId, limit: 100, offset: 0 },
        fetchPolicy: 'network-only',
      }) : Promise.resolve(null),
      userId ? apolloClient.query({
        query: GetBookmarkedPinIdsByUserIdDocument,
        variables: { userID: userId, limit: 100, offset: 0 },
        fetchPolicy: 'network-only',
      }) : Promise.resolve(null),
      countReactionsToPin({ pinId }),
    ]);
    if (cancelled?.()) return;

    const [likesResult, bookmarksResult, countResult] = results;
    if (likesResult.status === 'fulfilled') {
      setLiked(likesResult.value?.data?.likedPinsByUser?.some((item) => item.id === pinId) ?? false);
    } else console.error('[PinViewPage] Likes failed:', likesResult.reason);
    if (bookmarksResult.status === 'fulfilled') {
      setBookmarked(bookmarksResult.value?.data?.bookmarkedPinsByUser?.some((item) => item.id === pinId) ?? false);
    } else console.error('[PinViewPage] Bookmarks failed:', bookmarksResult.reason);
    if (countResult.status === 'fulfilled') {
      const count = countResult.value;
      if (Number.isFinite(count) && count >= 0) setLikesCount(count);
    } else console.error('[PinViewPage] Count failed:', countResult.reason);
  }, [pinId]);

  useEffect(() => {
    let cancelled = false;
    setReactionsLoading(true);
    setLiked(false);
    setBookmarked(false);
    setLikesCount(0);
    void refreshReactions(() => cancelled).finally(() => {
      if (!cancelled) setReactionsLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshReactions]);

  const handleReaction = async (kind: 'like' | 'bookmark') => {
    const userId = getUserIdFromToken();
    if (!pinId || pendingRef.current) return;
    if (!userId) {
      showToast('Необходимо войти в аккаунт', true);
      return;
    }
    pendingRef.current = true;
    setReactionPending(true);
    try {
      const ok = kind === 'like'
        ? await reactToPin({ pinId, reactionId: LIKE_REACTION_ID, userId })
        : await toggleBookmarkToPin({ pinId, userId });
      if (!ok) throw new Error(`${kind} mutation returned false`);
      await refreshReactions();
    } catch (err: unknown) {
      console.error(`[PinViewPage] ${kind} failed:`, err);
      showToast('Не удалось обновить реакцию', true);
    } finally {
      pendingRef.current = false;
      setReactionPending(false);
    }
  };

  const loadUserCollections = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setErrorCollections('Войдите в аккаунт, чтобы увидеть подборки');
      return;
    }
    setLoadingCollections(true);
    setErrorCollections(null);
    try {
      const result = await getOwnBoardsByUser({ userId, limit: 50, offset: 0 });
      setCollections((result ?? []).map((board) => ({
        id: board.id,
        name: board.name,
        description: board.description,
      })));
    } catch (err: unknown) {
      console.error('[PinViewPage] Board list failed:', err);
      setCollections([]);
      setErrorCollections('Не удалось загрузить подборки');
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  useEffect(() => {
    if (showCollectionsModal) void loadUserCollections();
  }, [showCollectionsModal, loadUserCollections]);

  const handleSelectCollection = async (boardId: string) => {
    if (!pinId || addingToBoard) return;
    setAddingToBoard(true);
    try {
      const ok = await addPinToBoard(pinId, boardId);
      if (!ok) throw new Error('addPinToBoard returned false');
      showToast('Пин добавлен в подборку!');
      setShowCollectionsModal(false);
    } catch (err: unknown) {
      console.error('[PinViewPage] Adding pin to board failed:', err);
      showToast('Не удалось добавить пин в подборку', true);
    } finally {
      setAddingToBoard(false);
    }
  };

  if (loading) return <div className={styles.pageWrapper}><Header /><div className={styles.loading}>Загрузка пина...</div></div>;
  if (error || !pin) return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.errorContainer}>
        <h2>Не удалось открыть пин</h2>
        <p>{error ?? 'Данные пина отсутствуют'}</p>
        <button type="button" className={styles.backButton} onClick={() => navigate('/feed')}>Вернуться на главную</button>
      </div>
    </div>
  );

  const pinImage = pin.images?.[0]?.imageUrl ?? placeholder;

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button type="button" className={styles.back_btn} onClick={() => navigate(-1)} aria-label="Назад" />
            <h2>
              {ownerId ? <>
                Пин от{' '}
                {loadingOwner ? 'Загрузка...' : <Link to={`/profile/${ownerId}`} className={styles.authorA}>
                  @{ownerData?.nickname ?? 'Пользователь'}
                </Link>}
              </> : 'Просмотр пина'}
            </h2>
            {isPinOwner && (
              <button type="button" className={styles.settingsBtn} onClick={() => navigate(`/pin/edit/${pinId}`)} aria-label="Редактировать пин" />
            )}
          </div>

          <div className={styles.pinCardWrapper}>
            <div className={styles.pinCard}>
              <img src={pinImage} alt={pin.name} className={styles.img1} />
              <h3 className={styles.pinTitle}>{pin.name}</h3>
              <p className={styles.collectionLocation}>Координаты: {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}</p>
              <p className={styles.pinDescription}>{pin.description ?? ''}</p>
              {!reactionsLoading && (
                <ReactionBlock
                  initialLikes={likesCount}
                  initialLiked={liked}
                  initialBookmarked={bookmarked}
                  onLike={() => void handleReaction('like')}
                  onBookmark={() => void handleReaction('bookmark')}
                  disabled={reactionPending || !currentUserId}
                />
              )}
            </div>
            <button type="button" className={styles.addTo} onClick={() => setShowCollectionsModal(true)}>
              Добавить пин в подборку
            </button>
          </div>
        </div>
        <div className={styles.mapWrapperFixed}>
          <MapPicker key={pin.id} initialCoords={[pin.latitude, pin.longitude]} onSelect={() => {}} />
        </div>
      </div>

      {showCollectionsModal && (
        <div className={styles.modalOverlay} onClick={() => !addingToBoard && setShowCollectionsModal(false)}>
          <div className={styles.modalContent} role="dialog" aria-modal="true" aria-label="Выберите подборку" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Выберите подборку</h3>
              <button type="button" className={styles.modalCloseBtn} disabled={addingToBoard} onClick={() => setShowCollectionsModal(false)} aria-label="Закрыть">×</button>
            </div>
            <div className={styles.modalBody}>
              {loadingCollections ? <p>Загрузка подборок...</p>
                : errorCollections ? <div className={styles.modalError}>
                    <p>{errorCollections}</p>
                    <button type="button" onClick={() => void loadUserCollections()} className={styles.retryButton}>Повторить попытку</button>
                  </div>
                : collections.length === 0 ? <div className={styles.modalEmpty}>
                    <p>У вас пока нет подборок</p>
                    <button type="button" onClick={() => navigate('/collection/create')} className={styles.createCollectionButton}>Создать подборку</button>
                  </div>
                : <ul className={styles.collectionsList}>
                    {collections.map((board) => <li key={board.id} className={styles.collectionItem}>
                      <button type="button" disabled={addingToBoard} onClick={() => void handleSelectCollection(board.id)}>
                        <span className={styles.collectionInfo}>
                          <span className={styles.collectionName}>{board.name}</span>
                          {board.description && <span className={styles.collectionDescription}>{board.description}</span>}
                        </span>
                        <span className={styles.collectionAction}>+</span>
                      </button>
                    </li>)}
                  </ul>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinViewPage;
