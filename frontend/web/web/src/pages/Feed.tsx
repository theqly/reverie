import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Feed.module.css';
import Header from './Header';
import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';

import { mockPins, mockCollections } from '../utils/mockData';
import { getPinsByUser, getOwnBoardsByUser } from '../services/profileService';

const Feed = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pins' | 'collections'>('pins');
  const [onlySubscriptions, setOnlySubscriptions] = useState(false);

  const [pins, setPins] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

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
      const response = await getPinsByUser({
        viewerId: '000', // временно
        userId: '000', // временно

        limit: 20,
        offset: 0,
      });

      if (response && response.length > 0) {
        setPins(response);
      } else {
        console.log("Использовали моки");
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
      const response = await getOwnBoardsByUser({
        userId: '000', // временно
        limit: 20,
        offset: 0,
      });

      if (response && response.length > 0) {
        setCollections(response);
      } else {
        console.log("Использовали моки");

        setCollections(mockCollections);
      }
    } catch (err) {
      console.error('[Feed] getCollections error:', err);
      setCollections(mockCollections);
      setError('Не удалось загрузить подборки');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Эффекты
  ======================= */

  useEffect(() => {
    if (activeTab === 'pins') {
      handleGetPins();
    }

    if (activeTab === 'collections') {
      handleGetCollections();
    }
  }, [activeTab]);

  /* =======================
     Фильтрация
  ======================= */

  const filteredPins = onlySubscriptions
    ? pins.filter(pin =>
        ['jane_anderson', 'alex_smith'].includes(pin.author)
      )
    : pins;

  const filteredCollections = onlySubscriptions
    ? collections.filter(col =>
        ['jane_anderson', 'hana_tanaka'].includes(col.author)
      )
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
