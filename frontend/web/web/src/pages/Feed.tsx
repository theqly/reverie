import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Feed.module.css';
import Header from './Header';
import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';

import { mockPins, mockCollections } from '../utils/mockData';
import { transformPins, transformBoards, type DisplayPin, type DisplayCollection } from '../utils/transformers';
import { getAllPins, getAllBoards } from '../services/profileService';
import { useCurrentUserId } from '../context/AuthContext';
import { loadLocationsForItems, loadLocationsForBoards } from '../services/geoService';
import { getFollowing } from '../services/followService';

const Feed = () => {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();

  const [activeTab, setActiveTab] = useState<'pins' | 'collections'>('pins');
  const [onlySubscriptions, setOnlySubscriptions] = useState(false);

  const [pins, setPins] = useState<DisplayPin[]>([]);
  const [collections, setCollections] = useState<DisplayCollection[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Навигация
  ======================= */

  const handlePlusClick = () => {
    if (activeTab === 'pins') {
      navigate('/pin/create');
    } else {
      navigate('/collection/create');
    }
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

  /* =======================
     Загрузка данных
  ======================= */

  const handleGetPins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllPins({
        viewerId: currentUserId,
        limit: 50,
        offset: 0,
      });

      if (response && response.length > 0) {
        // Сначала показываем пины БЕЗ локаций (мгновенно)
        const displayPins = transformPins(response);
        setPins(displayPins);

        // Затем загружаем все локации и обновляем состояние ОДИН раз
        loadLocationsForItems(displayPins).then(locations => {
          setPins(prev => prev.map(pin => ({
            ...pin,
            location: locations.get(pin.id) || pin.location,
          })));
        });
      } else {
        setPins(mockPins);
      }
    } catch (err) {
      console.error('[Feed] getPins error:', err);
      setPins(mockPins);
      setError('Не удалось загрузить пины');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllBoards({
        viewerId: currentUserId,
        limit: 50,
        offset: 0,
      });

      if (response && response.length > 0) {
        // Сначала показываем коллекции БЕЗ локаций (мгновенно)
        const displayCollections = transformBoards(response);
        setCollections(displayCollections);

        // Затем загружаем все локации и обновляем состояние ОДИН раз
        loadLocationsForBoards(displayCollections).then(locations => {
          setCollections(prev => prev.map(col => ({
            ...col,
            location: locations.get(col.id) || col.location,
          })));
        });
      } else {
        setCollections(mockCollections);
      }
    } catch (err) {
      console.error('[Feed] getBoards error:', err);
      setCollections(mockCollections);
      setError('Не удалось загрузить подборки');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Загрузка подписок
  ======================= */

  const loadFollowing = async () => {
    if (!currentUserId) return;

    try {
      const following = await getFollowing(currentUserId);
      const ids = new Set(following.map((user: { id: string }) => user.id));
      setFollowingIds(ids);
    } catch (err) {
      console.error('[Feed] loadFollowing error:', err);
    }
  };

  /* =======================
     Эффекты
  ======================= */

  // Загружаем подписки при включении фильтра
  useEffect(() => {
    if (onlySubscriptions && currentUserId && followingIds.size === 0) {
      loadFollowing();
    }
  }, [onlySubscriptions, currentUserId]);

  useEffect(() => {
    if (activeTab === 'pins') {
      handleGetPins();
    }

    if (activeTab === 'collections') {
      handleGetCollections();
    }
  }, [activeTab, currentUserId]);

  /* =======================
     Фильтрация
  ======================= */

  const filteredPins = onlySubscriptions
    ? pins.filter(pin => followingIds.has(pin.ownerId))
    : pins;

  const filteredCollections = onlySubscriptions
    ? collections.filter(col => followingIds.has(col.ownerId))
    : collections;

  /* =======================
     Render
  ======================= */

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

          {currentUserId && (
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={onlySubscriptions}
                  onChange={e => setOnlySubscriptions(e.target.checked)}
                  className={styles.hiddenCheckbox}
              />
              <span className={styles.customCheckbox}>
                {onlySubscriptions && (
                  <svg className={styles.checkIcon} viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </span>
              <span className={styles.checkboxText}>
                Только подписки
              </span>
            </label>
            </div>
          )}
        </section>

        {loading && <p className={styles.loading}>Загрузка…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {activeTab === 'pins' && (
          <div className={styles.pinsGridContainer}>
            <PinGrid pins={filteredPins} onPinClick={handlePinClick} />
          </div>
        )}

        {activeTab === 'collections' && (
          <div className={styles.collectionsGridContainer}>
            <CollectionGrid
              collections={filteredCollections}
              onCollectionClick={handleCollectionClick}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
