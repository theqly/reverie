
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Feed.module.css';
import Header from './Header';
import PinGrid from '../features/pins/components/PinGrid';
import CollectionGrid from '../features/collections/components/CollectionGrid';

import {
  getPinsByUser,
  getOwnBoardsByUser,
} from '../services/profileService';

import type {
  GetPinsByUserIdQuery,
  GetOwnBoardsByUserIdQuery,
} from '@/graphql/generated/graphql';

import placeholder_1 from '../assets/placeholder1.jpg';

type FeedPin =
  NonNullable<GetPinsByUserIdQuery['pinsByUser']>[number];

type FeedCollection =
  GetOwnBoardsByUserIdQuery['ownBoardsByUser'][number];

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

const Feed = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pins' | 'collections'>('pins');

  const [pins, setPins] = useState<FeedPin[]>([]);
  const [collections, setCollections] = useState<FeedCollection[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlusClick = () => {
    navigate(
      activeTab === 'pins'
        ? '/pin/create'
        : '/collection/create',
    );
  };

  const getPlusButtonTitle = () =>
    activeTab === 'pins'
      ? 'Создать новый пин'
      : 'Создать новую подборку';

  const handlePinClick = (pinId: string) => {
    navigate(`/pin/${pinId}`);
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collection/${collectionId}`);
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === 'pins') {
          const response = await getPinsByUser({
            viewerId: TEMP_USER_ID,
            userId: TEMP_USER_ID,
            limit: 20,
            offset: 0,
          });

          if (!cancelled) {
            setPins(response ?? []);
          }
        } else {
          const response = await getOwnBoardsByUser({
            userId: TEMP_USER_ID,
            limit: 20,
            offset: 0,
          });

          if (!cancelled) {
            setCollections(response ?? []);
          }
        }
      } catch (err) {
        if (cancelled) return;

        console.error('[Feed] Loading error:', err);

        if (activeTab === 'pins') {
          setPins([]);
          setError('Не удалось загрузить пины');
        } else {
          setCollections([]);
          setError('Не удалось загрузить подборки');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Временное представление данных для существующего PinGrid.
  // Позже изменим сам PinGridItem под поля GraphQL.
  const displayPins = pins.map((pin) => ({
    id: pin.id,
    title: pin.name,
    image:
      pin.images?.[0]?.imageUrl ?? placeholder_1,
    location: `${pin.latitude}, ${pin.longitude}`,
    author: 'Автор неизвестен',
    authorAvatar: placeholder_1,
  }));

  // Временное представление для существующего CollectionGrid.
  const displayCollections = collections.map((col) => ({
    id: col.id,
    title: col.name,
    description: col.description ?? '',
    image: col.pins?.[0]?.images?.[0]?.imageUrl ?? placeholder_1,
    location: '',
    author: 'Автор неизвестен',
    authorAvatar: placeholder_1,
    pinsCount: col.pins?.length ?? 0,
  }));

  return (
    <div>
      <Header />

      <main className={styles.collectionContent}>
        <section className={styles.container}>
          <h2 className={styles.h_header}>Рекомендации</h2>

          <div className={styles.centerPanel}>
            <button
              className={styles.floatingPlusBtn}
              onClick={handlePlusClick}
              aria-label="Создать"
              title={getPlusButtonTitle()}
            >
              <svg viewBox="0 0 24 24" fill="none">
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
                className={`${styles.tabButton} ${
                  activeTab === 'pins' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('pins')}
              >
                Пины
              </button>

              <button
                className={`${styles.tabButton} ${
                  activeTab === 'collections' ? styles.active : ''
                }`}
                onClick={() => setActiveTab('collections')}
              >
                Подборки
              </button>

              <div
                className={styles.tabIndicator}
                data-active={activeTab}
              />
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

        {loading && (
          <p className={styles.loading}>Загрузка…</p>
        )}

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {!loading && !error && activeTab === 'pins' && (
          <div className={styles.pinsGridContainer}>
            {displayPins.length > 0 ? (
              <PinGrid
                pins={displayPins}
                onPinClick={handlePinClick}
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
                onCollectionClick={handleCollectionClick}
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
