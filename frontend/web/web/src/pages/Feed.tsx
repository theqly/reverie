import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Feed.module.css';
import Header from './Header';
import PinGrid from '../features/pins/components/PinGrid';
import CollectionGrid from '../features/collections/components/CollectionGrid';
import placeholder_1 from '../assets/placeholder1.jpg';

import { getUserIdFromToken } from '../auth/tokenStorage';
import { getPinsByUser, getOwnBoardsByUser, findUser } from '../services/profileService';
import { getCityFromCoordinates } from '../services/geoService';

import type {
  GetPinsByUserIdQuery,
  GetOwnBoardsByUserIdQuery,
} from '@/graphql/generated/graphql';

type FeedPin = NonNullable<
  NonNullable<GetPinsByUserIdQuery['pinsByUser']>[number]
>;
type FeedCollection = NonNullable<
  NonNullable<GetOwnBoardsByUserIdQuery['ownBoardsByUser']>[number]
>;

type Tab = 'pins' | 'collections';

const Feed = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('pins');
  const [pins, setPins] = useState<FeedPin[]>([]);
  const [collections, setCollections] = useState<FeedCollection[]>([]);
  const [pinLocations, setPinLocations] = useState<Record<string, string>>({});
  const [author, setAuthor] = useState({
    nickname: 'Автор неизвестен',
    avatar: placeholder_1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = getUserIdFromToken();

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    void findUser({ id: userId })
      .then((user) => {
        if (!cancelled && user) {
          setAuthor({
            nickname: user.nickTag || user.nickname || 'Пользователь',
            avatar: user.profilePicture || placeholder_1,
          });
        }
      })
      .catch((err: unknown) => {
        console.warn('[Feed] Не удалось получить профиль автора:', err);
      });

    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (!userId) {
        setPins([]);
        setCollections([]);
        setError('Не удалось определить пользователя. Войдите в аккаунт.');
        setLoading(false);
        return;
      }

      try {
        if (activeTab === 'pins') {
          const response = await getPinsByUser({
            viewerId: userId,
            userId,
            limit: 20,
            offset: 0,
          });
          if (cancelled) return;

          const fetchedPins = (response ?? []).filter(
            (pin): pin is FeedPin => pin != null,
          );
          setPins(fetchedPins);

          // Получение города — дополнительная функция; её сбой
          // не должен скрывать загруженные пины.
          const locations = await Promise.all(
            fetchedPins.map(async (pin) => {
              try {
                const city = await getCityFromCoordinates(
                  pin.latitude,
                  pin.longitude,
                );
                return [pin.id, city] as const;
              } catch (err) {
                console.warn('[Feed] Не удалось определить город:', err);
                return [pin.id, ''] as const;
              }
            }),
          );
          if (!cancelled) {
            setPinLocations(Object.fromEntries(locations));
          }
        } else {
          const response = await getOwnBoardsByUser({
            userId,
            limit: 20,
            offset: 0,
          });
          if (!cancelled) {
            setCollections(
              (response ?? []).filter(
                (board): board is FeedCollection => board != null,
              ),
            );
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('[Feed] Loading error:', err);
        setError(
          activeTab === 'pins'
            ? 'Не удалось загрузить пины'
            : 'Не удалось загрузить подборки',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [activeTab, userId]);

  const displayPins = pins.map((pin) => ({
    id: pin.id,
    title: pin.name,
    image: pin.images?.[0]?.imageUrl ?? placeholder_1,
    location: pinLocations[pin.id] ?? `${pin.latitude}, ${pin.longitude}`,
    author: author.nickname,
    authorAvatar: author.avatar,
  }));

  const displayCollections = collections.map((board) => ({
    id: board.id,
    title: board.name,
    description: board.description ?? '',
    image:
      ('boardImageURL' in board &&
      typeof board.boardImageURL === 'string' &&
      board.boardImageURL) ||
      board.pins?.[0]?.images?.[0]?.imageUrl ||
      placeholder_1,
    location: '',
    author: author.nickname,
    authorAvatar: author.avatar,
    pinsCount: board.pins?.length ?? 0,
  }));

  const handlePlusClick = () => {
    navigate(activeTab === 'pins' ? '/pin/create' : '/collection/create');
  };

  return (
    <div>
      <Header />
      <main className={styles.collectionContent}>
        <section className={styles.container}>
          <h2 className={styles.h_header}>Рекомендации</h2>
          <div className={styles.centerPanel}>
            <button
              type="button"
              className={styles.floatingPlusBtn}
              onClick={handlePlusClick}
              aria-label="Создать"
              title={
                activeTab === 'pins'
                  ? 'Создать новый пин'
                  : 'Создать новую подборку'
              }
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className={styles.tabSwitcher}>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  activeTab === 'pins' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('pins')}
              >
                Пины
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  activeTab === 'collections' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('collections')}
              >
                Подборки
              </button>
              <div className={styles.tabIndicator} data-active={activeTab} />
            </div>
          </div>
          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={false}
                disabled
                className={styles.hiddenCheckbox}
              />
              <span className={styles.customCheckbox} />
              <span className={styles.checkboxText}>
                Только подписки (пока недоступно)
              </span>
            </label>
          </div>
        </section>

        {loading && <p className={styles.loading}>Загрузка…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && activeTab === 'pins' && (
          <div className={styles.pinsGridContainer}>
            {displayPins.length > 0 ? (
              <PinGrid
                pins={displayPins}
                onPinClick={(pinId: string) => navigate(`/pin/${pinId}`)}
              />
            ) : (
              <p>Пинов пока нет</p>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'collections' && (
          <div className={styles.collectionsGridContainer}>
            {displayCollections.length > 0 ? (
              <CollectionGrid
                collections={displayCollections}
                onCollectionClick={(collectionId: string) =>
                  navigate(`/collection/${collectionId}`)
                }
              />
            ) : (
              <p>Подборок пока нет</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
