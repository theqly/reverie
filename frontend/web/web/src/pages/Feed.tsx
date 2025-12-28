import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Feed.module.css';
import Header from './Header';
import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';
import {getUserIdFromToken} from '../auth/tokenStorage';

import { mockPins, mockCollections } from '../utils/mockData';
import { getPinsByUser, getOwnBoardsByUser } from '../services/profileService';
import { getCityFromCoordinates } from '../services/geoService';

import { findUser } from '../services/profileService';

import placeholder_1 from '../assets/placeholder1.jpg';

const Feed = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pins' | 'collections'>('pins');
  const [onlySubscriptions, setOnlySubscriptions] = useState(false);

  const [pins, setPins] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const UUID = String(getUserIdFromToken());

  /* =======================
     Navigation
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

  const handlePinClick = (pinId: string, owner: string, ownerId: string) => {
    navigate(`/pin/${pinId}?owner=${owner}&ownerId=${ownerId}`);
  };

  const handleCollectionClick = (collectionId: string, owner: string, ownerId: string) => {
    navigate(`/collection/${collectionId}?owner=${owner}&ownerId=${ownerId}`);
  };

  /* =======================
     Data loading
  ======================= */
  let userIdd = getUserIdFromToken();
  let UUID2 = '458c47be-bcab-4572-bf06-bafbc7c536ec';
  console.log("USER ID" + userIdd);

  const handleGetPins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPinsByUser({
        viewerId: UUID2,
        userId: UUID2,
        limit: 20,
        offset: 0,
      });

      const response2 = await getPinsByUser({
        viewerId: UUID,
        userId: UUID,
        limit: 20,
        offset: 0,
      });

      // Добавляем поле author к пинам из первого ответа
      const pinsFromResponse1 = response 
        ? response.map(pin => ({
            ...pin,
            authorId: UUID2,
            ownerId: UUID2
          }))
        : [];

      // Добавляем поле author к пинам из второго ответа  
      const pinsFromResponse2 = response2
        ? response2.map(pin => ({
            ...pin,
            authorId: String(getUserIdFromToken()),
            ownerId: String(getUserIdFromToken())
          }))
        : [];

      // Объединяем оба массива
      const combinedPins = [
        ...pinsFromResponse1,
        ...pinsFromResponse2
      ];

      const sourcePins = combinedPins.length > 0 ? combinedPins : mockPins;

      // Получаем уникальные ID авторов
      const uniqueAuthorIds = [...new Set(sourcePins.map(pin => pin.authorId))];
      
      // Получаем информацию обо всех авторах параллельно
      const authorsPromises = uniqueAuthorIds.map(authorId => findUser({ id: authorId }));
      const authors = await Promise.all(authorsPromises);
      
      // Создаем маппинг authorId -> данные пользователя
      const authorMap = new Map();
      authors.forEach((user, index) => {
        if (user) {
          authorMap.set(uniqueAuthorIds[index], {
            nickname: user.nickTag || user.nickname || 'unknown',
            profilePicture: user.profilePicture || placeholder_1,
            name: user.nickname || user.nickTag || 'Пользователь'
          });
        }
      });

      // 🔥 здесь получаем город по координатам и добавляем данные автора
      const pinsWithLocationAndAuthor = await Promise.all(
        sourcePins.map(async (pin) => {
          let location = '';
          const authorData = authorMap.get(pin.authorId) || {
            nickname: pin.authorId,
            profilePicture: placeholder_1,
            name: 'Пользователь'
          };

          if (pin.latitude && pin.longitude) {
            try {
              location = await getCityFromCoordinates(
                pin.latitude,
                pin.longitude
              );
            } catch (e) {
              console.warn('Не удалось определить город', e);
            }
          }

          return {
            ...pin,
            location, // ← готовая строка города
            author: authorData.nickname, // ← никнейм автора
            authorAvatar: authorData.profilePicture, // ← аватарка автора
            authorName: authorData.name, // ← имя автора
          };
        })
      );

      setPins(pinsWithLocationAndAuthor);
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
      const [response, response2] = await Promise.all([
        getOwnBoardsByUser({
          userId: UUID,
          limit: 20,
          offset: 0,
        }),
        getOwnBoardsByUser({
          userId: UUID,
          limit: 20,
          offset: 0,
        })
      ]);

      const collectionsFromResponse1 = response 
        ? response.map(col => ({
            ...col,
            authorId: UUID
          }))
        : [];

      const collectionsFromResponse2 = response2
        ? response2.map(col => ({
            ...col,
            authorId: UUID,
            ownerId: UUID
          }))
        : [];

      // Объединяем оба массива
      const combinedCollections = [
        //...collectionsFromResponse1,
        ...collectionsFromResponse2
      ];

      if (combinedCollections.length > 0) {
        // Получаем данные всех авторов за один запрос
        const uniqueAuthorIds = [...new Set(combinedCollections.map(col => col.authorId))];
        
        // Получаем информацию обо всех авторах параллельно
        const authorsPromises = uniqueAuthorIds.map(authorId => findUser({ id: authorId }));
        const authors = await Promise.all(authorsPromises);
        
        // Создаем маппинг authorId -> данные пользователя
        const authorMap = new Map();
        authors.forEach((user, index) => {
          if (user) {
            authorMap.set(uniqueAuthorIds[index], {
              nickname: user.nickTag || user.nickname || 'unknown',
              profilePicture: user.profilePicture || placeholder_1,
              name: user.nickname || user.nickTag || 'Пользователь'
            });
          }
        });

        // Добавляем данные авторов к подборкам
        const collectionsWithAuthors = combinedCollections.map(col => {
          const authorData = authorMap.get(col.authorId) || {
            nickname: col.authorId,
            profilePicture: placeholder_1,
            name: 'Пользователь'
          };
          
          return {
            ...col,
            author: authorData.nickname, // ← никнейм автора
            authorAvatar: authorData.profilePicture, // ← аватарка автора
            authorName: authorData.name, // ← имя автора
          };
        });

        setCollections(collectionsWithAuthors);
      } else {
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
     Effects
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
     Filters
  ======================= */

  const filteredPins = onlySubscriptions
    ? pins.filter((pin) =>
        ['jane_anderson', 'alex_smith'].includes(pin.author)
      )
    : pins;

  const filteredCollections = onlySubscriptions
    ? collections.filter((col) =>
        ['jane_anderson', 'hana_tanaka'].includes(col.author)
      )
    : collections;

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
                onChange={(e) =>
                  setOnlySubscriptions(e.target.checked)
                }
                className={styles.hiddenCheckbox}
              />
              <span className={styles.customCheckbox}>
                {onlySubscriptions && (
                  <svg
                    className={styles.checkIcon}
                    viewBox="0 0 24 24"
                  >
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

        {loading && (
          <p className={styles.loading}>Загрузка…</p>
        )}
        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {activeTab === 'pins' && (
          <div className={styles.pinsGridContainer}>
            <PinGrid
              pins={filteredPins.map((pin) => ({
                ...pin,
                image: pin.images?.[0]?.imageUrl || pin.imageUrl || placeholder_1, // используем реальное изображение пина
                title: pin.name || pin.title,
                location: pin.location,
                author: pin.author,
                authorAvatar: pin.authorAvatar, // ← передаем аватарку автора
              }))}
              onPinClick={handlePinClick}
            />
          </div>
        )}

        {activeTab === 'collections' && (
          <div className={styles.collectionsGridContainer}>
            <CollectionGrid
              collections={filteredCollections.map((col) => ({
                ...col,
                image: col.boardImageURL || col.image || placeholder_1, // используем реальное изображение подборки
                title: col.name,
                pinsCount: col.pins ? col.pins.length : 0,
                author: col.author,
                authorAvatar: col.authorAvatar, // ← передаем аватарку автора
              }))}
              onCollectionClick={handleCollectionClick}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;