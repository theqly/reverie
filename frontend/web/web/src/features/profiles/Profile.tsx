
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Profile.module.css';
import Header from '../../pages/Header';

import EditProfileModal from './EditProfileModal';
import SettingsModal from '../../pages/SettingsModal';
import ShareModal from '../../pages/ShareModal';
import ReportModal from '../../pages/ReportModal';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';

import PinGrid from '../pins/components/PinGrid';
import CollectionGrid from '../collections/components/CollectionGrid';

import placeholder_3 from '../../assets/placeholder3.jpg';
import placeholder_1 from '../../assets/placeholder1.jpg';

import {
  getPinsByUser,
  getOwnBoardsByUser,
  getLikesByUser,
  getBookmarksByUser,
} from '../../services/profileService';

type TabType = 'collections' | 'pins' | 'likes' | 'bookmarks';

// Типы получаем из сервисов, без дублирования GraphQL-сущностей.
type PinItem =
  NonNullable<Awaited<ReturnType<typeof getPinsByUser>>>[number];

type CollectionItem =
  NonNullable<Awaited<ReturnType<typeof getOwnBoardsByUser>>>[number];

type LikesResponse =
  NonNullable<Awaited<ReturnType<typeof getLikesByUser>>>;

type BookmarksResponse =
  NonNullable<Awaited<ReturnType<typeof getBookmarksByUser>>>;

type LikedPin = NonNullable<LikesResponse['pins']>[number];
type LikedCollection = NonNullable<LikesResponse['boards']>[number];

type BookmarkedPin =
  NonNullable<BookmarksResponse['pins']>[number];

type BookmarkedCollection =
  NonNullable<BookmarksResponse['boards']>[number];

// Временный UUID до подключения авторизации.
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

// Формат существующего UI-компонента PinGridItem.
type PinCard = {
  id: string;
  title: string;
  image: string;
  location: string;
  author: string;
  authorAvatar: string;
};

type CollectionCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  pinsCount: number;
  location: string;
  author: string;
  authorAvatar: string;
};

type FeedBlock =
  | { type: 'pins'; items: PinCard[] }
  | { type: 'collections'; items: CollectionCard[] };

// Проверка данных без приведения к any.
const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const getString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const getFirstImage = (value: unknown): string => {
  if (!Array.isArray(value)) return placeholder_1;

  const firstImage: unknown = value[0];

  if (!isRecord(firstImage)) return placeholder_1;

  return getString(firstImage.imageUrl) ?? placeholder_1;
};

// Временное преобразование API-данных для старого PinGridItem.
const toPinCard = (value: unknown): PinCard | null => {
  if (!isRecord(value)) return null;

  const id = getString(value.id);
  if (!id) return null;

  const name =
    getString(value.name) ??
    getString(value.title) ??
    'Без названия';

  const latitude = value.latitude;
  const longitude = value.longitude;

  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number';

  return {
    id,
    title: name,
    image:
      getFirstImage(value.images),
    location: hasCoords
      ? `${latitude}, ${longitude}`
      : '',
    author: 'Автор неизвестен',
    authorAvatar: placeholder_1,
  };
};

// Временное преобразование API-данных для CollectionGridItem.
const toCollectionCard = (
  value: unknown,
): CollectionCard | null => {
  if (!isRecord(value)) return null;

  const id = getString(value.id);
  if (!id) return null;

  const pins = Array.isArray(value.pins) ? value.pins : [];

  const firstPin: unknown = pins[0];

  const image =
    isRecord(firstPin)
      ? getFirstImage(firstPin.images)
      : placeholder_1;

  return {
    id,
    title: getString(value.name) ?? 'Без названия',
    description: getString(value.description) ?? '',
    image,
    pinsCount: pins.length,
    location: '',
    author: 'Автор неизвестен',
    authorAvatar: placeholder_1,
  };
};

const toPinCards = (items: readonly unknown[]): PinCard[] =>
  items
    .map(toPinCard)
    .filter((item): item is PinCard => item !== null);

const toCollectionCards = (
  items: readonly unknown[],
): CollectionCard[] =>
  items
    .map(toCollectionCard)
    .filter((item): item is CollectionCard => item !== null);

const generateMixedFeed = (
  collections: CollectionCard[],
  pins: PinCard[],
): FeedBlock[] => {
  const COLLECTIONS_PER_BLOCK = 2;
  const PINS_PER_BLOCK = 5;

  const colls = [...collections];
  const ps = [...pins];

  const feed: FeedBlock[] = [];
  let next: 'collections' | 'pins' = 'collections';

  while (colls.length > 0 || ps.length > 0) {
    if (next === 'collections' && colls.length > 0) {
      feed.push({
        type: 'collections',
        items: colls.splice(0, COLLECTIONS_PER_BLOCK),
      });
      next = 'pins';
    } else if (next === 'pins' && ps.length > 0) {
      feed.push({
        type: 'pins',
        items: ps.splice(0, PINS_PER_BLOCK),
      });
      next = 'collections';
    } else {
      next = colls.length > 0 ? 'collections' : 'pins';
    }
  }

  return feed;
};

const Profile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('collections');

  const [isEditOpen, setEditOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isFollowersOpen, setFollowersOpen] = useState(false);
  const [isFollowingOpen, setFollowingOpen] = useState(false);

  const [isFollowing, setFollowing] = useState(false);

  // TODO: заменить статические данные на API профиля.
  const [profileData, setProfileData] = useState({
    name: 'Jane Anderson',
    bio: 'The photographer capturing moments around the world based in Paris',
    avatar: placeholder_3,
    nickname: 'wanderlust_jane',
  });

  const [pins, setPins] = useState<PinItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);

  const [likedPins, setLikedPins] = useState<LikedPin[]>([]);
  const [likedCollections, setLikedCollections] =
    useState<LikedCollection[]>([]);

  const [bookmarkedPins, setBookmarkedPins] =
    useState<BookmarkedPin[]>([]);
  const [bookmarkedCollections, setBookmarkedCollections] =
    useState<BookmarkedCollection[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => navigate(-1);

  const handleCreatePin = () => navigate('/pin/create');
  const handleCreateCollection = () =>
    navigate('/collection/create');

  const handlePinClick = (pinId: string) => {
    navigate(`/pin/${pinId}`);
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collection/${collectionId}`);
  };

  // Загружаем только данные активной вкладки.
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (activeTab) {
          case 'pins': {
            const response = await getPinsByUser({
              viewerId: TEMP_USER_ID,
              userId: TEMP_USER_ID,
              limit: 20,
              offset: 0,
            });

            if (!cancelled) {
              setPins(response ?? []);
            }
            break;
          }

          case 'collections': {
            const response = await getOwnBoardsByUser({
              userId: TEMP_USER_ID,
              limit: 20,
              offset: 0,
            });

            if (!cancelled) {
              setCollections(response ?? []);
            }
            break;
          }

          case 'likes': {
            const response = await getLikesByUser({
              userId: TEMP_USER_ID,
              pinsLimit: 20,
              pinsOffset: 0,
              boardsLimit: 10,
              boardsOffset: 0,
            });

            if (!cancelled) {
              setLikedPins(response?.pins ?? []);
              setLikedCollections(response?.boards ?? []);
            }
            break;
          }

          case 'bookmarks': {
            const response = await getBookmarksByUser({
              userId: TEMP_USER_ID,
              pinsLimit: 20,
              pinsOffset: 0,
              boardsLimit: 10,
              boardsOffset: 0,
            });

            if (!cancelled) {
              setBookmarkedPins(response?.pins ?? []);
              setBookmarkedCollections(response?.boards ?? []);
            }
            break;
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;

        console.error(
          `[Profile] Failed to load ${activeTab}:`,
          err,
        );

        switch (activeTab) {
          case 'pins':
            setPins([]);
            setError('Не удалось загрузить пины');
            break;

          case 'collections':
            setCollections([]);
            setError('Не удалось загрузить подборки');
            break;

          case 'likes':
            setLikedPins([]);
            setLikedCollections([]);
            setError('Не удалось загрузить лайки');
            break;

          case 'bookmarks':
            setBookmarkedPins([]);
            setBookmarkedCollections([]);
            setError('Не удалось загрузить закладки');
            break;
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

  const displayPins = toPinCards(pins);
  const displayCollections = toCollectionCards(collections);

  const likesFeed = generateMixedFeed(
    toCollectionCards(likedCollections),
    toPinCards(likedPins),
  );

  const bookmarksFeed = generateMixedFeed(
    toCollectionCards(bookmarkedCollections),
    toPinCards(bookmarkedPins),
  );

  const renderMixedFeed = (blocks: FeedBlock[]) => (
    <div className={styles.likesFeed}>
      {blocks.length === 0 && (
        <p>Пока ничего нет</p>
      )}

      {blocks.map((block, index) => (
        <div
          key={`${block.type}-${index}`}
          className={styles.feedBlock}
        >
          {block.type === 'collections' ? (
            <CollectionGrid
              collections={block.items}
              onCollectionClick={handleCollectionClick}
            />
          ) : (
            <PinGrid
              pins={block.items}
              onPinClick={handlePinClick}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button
            onClick={handleBack}
            className={styles.back_btn}
            aria-label="Назад"
          />

          <h1>@{profileData.nickname}</h1>
        </div>

        <section className={styles.main_content}>
          <div style={{ display: 'flex', width: '100%' }}>
            <div className={styles.profile}>
              <img
                src={profileData.avatar}
                alt="Аватар профиля"
                className={styles.avatar}
              />

              <div className={styles.info}>
                <div className={styles.name}>
                  {profileData.name}
                </div>

                <ul className={styles.follow_options}>
                  <li>
                    <button
                      className={styles.followLink}
                      onClick={() => setFollowersOpen(true)}
                    >
                      <p>1247</p> подписчиков
                    </button>
                  </li>

                  <li>
                    <button
                      className={styles.followLink}
                      onClick={() => setFollowingOpen(true)}
                    >
                      <p>450</p> подписок
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className={styles.btn_container}
              style={{ display: 'flex' }}
            >
              <button
                className={styles.edit_btn}
                onClick={() => setEditOpen(true)}
              >
                Редактировать профиль
              </button>

              <button
                className={styles.settingsBtn}
                onClick={() => setSettingsOpen(true)}
                aria-label="Настройки"
              />

              <button
                className={styles.shareBtn}
                onClick={() => setShareOpen(true)}
                aria-label="Поделиться"
              />
            </div>
          </div>

          <div className={styles.bio}>
            {profileData.bio}
          </div>

          <div style={{ display: 'flex' }}>
            <button
              className={styles.editBtn}
              onClick={() => setFollowing((prev) => !prev)}
            >
              {isFollowing ? 'Отписаться' : 'Подписаться'}
            </button>

            <button
              className={styles.reportBtn}
              onClick={() => setReportOpen(true)}
            >
              !
            </button>
          </div>
        </section>

        <div className={styles.tabs}>
          {(
            ['collections', 'pins', 'likes', 'bookmarks'] as TabType[]
          ).map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${
                activeTab === tab ? styles.active : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {
                {
                  collections: 'Подборки',
                  pins: 'Пины',
                  likes: 'Понравившиеся',
                  bookmarks: 'Закладки',
                }[tab]
              }
            </button>
          ))}
        </div>

        {loading && (
          <p className={styles.loading}>Загрузка…</p>
        )}

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {!loading && !error && (
          <div className={styles.tabContent}>
            {activeTab === 'collections' && (
              <>
                <button
                  onClick={handleCreateCollection}
                  className={styles.newBoardBtn}
                >
                  Создать подборку
                </button>

                {displayCollections.length > 0 ? (
                  <CollectionGrid
                    collections={displayCollections}
                    onCollectionClick={handleCollectionClick}
                  />
                ) : (
                  <p>Подборок пока нет</p>
                )}
              </>
            )}

            {activeTab === 'pins' && (
              <>
                <button
                  onClick={handleCreatePin}
                  className={styles.newPinBtn}
                >
                  Создать пин
                </button>

                {displayPins.length > 0 ? (
                  <PinGrid
                    pins={displayPins}
                    onPinClick={handlePinClick}
                  />
                ) : (
                  <p>Пинов пока нет</p>
                )}
              </>
            )}

            {activeTab === 'likes' &&
              renderMixedFeed(likesFeed)}

            {activeTab === 'bookmarks' &&
              renderMixedFeed(bookmarksFeed)}
          </div>
        )}

        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          onSave={setProfileData}
          initialData={profileData}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setShareOpen(false)}
        />

        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={(data) => console.log('Жалоба:', data)}
        />

        <FollowersModal
          isOpen={isFollowersOpen}
          onClose={() => setFollowersOpen(false)}
        />

        <FollowingModal
          isOpen={isFollowingOpen}
          onClose={() => setFollowingOpen(false)}
        />
      </main>
    </div>
  );
};

export default Profile;
