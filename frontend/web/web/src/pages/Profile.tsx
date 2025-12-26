import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import styles from './Profile.module.css';
import Header from './Header';

import EditProfileModal from './EditProfileModal';
import SettingsModal from './SettingsModal';
import ShareModal from './ShareModal';
import ReportModal from './ReportModal';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';

import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';

import placeholder_1 from '../assets/placeholder1.jpg';
import placeholder_2 from '../assets/placeholder2.jpg';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_4 from '../assets/placeholder4.jpg';
import placeholder_6 from '../assets/placeholder6.jpg';
import placeholder_7 from '../assets/placeholder7.jpg';
import placeholder_8 from '../assets/placeholder8.jpg';
import placeholder_9 from '../assets/placeholder9.jpg';

import { mockPins, mockCollections } from '../utils/mockData';
import type { Pin, Board } from '../graphql/generated/graphql';

// Типы для отображаемых данных
interface DisplayPin {
  id: string;
  title: string;
  image: string;
  location: string;
  author: string;
  authorAvatar: string;
}

interface DisplayCollection {
  id: string;
  title: string;
  image: string;
  boardImageURL?: string;
  location: string;
  pinsCount: number;
  author: string;
  authorAvatar: string;
}

interface DisplayUser {
  id: string;
  nickname: string;
  nickTag: string;
  avatar: string;
}

// Массив placeholder картинок для разнообразия (пока нет S3)
const placeholders = [
  placeholder_1, placeholder_2, placeholder_3, placeholder_4,
  placeholder_6, placeholder_7, placeholder_8, placeholder_9
];

// Функция для получения placeholder по ID (консистентно для одного и того же пина)
const getPlaceholderById = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return placeholders[hash % placeholders.length];
};
import {
  getPinsByUser,
  getOwnBoardsByUser,
  getLikesByUser,
  getBookmarksByUser,
  findUser,
  updateUser,
} from '../services/profileService';
import { followUser, unfollowUser } from '../services/followService';
import { useCurrentUserId, useAuth } from '../context/AuthContext';
import { getLocationForBoard, getCityFromCoordinates } from '../services/geoService';

type TabType = 'collections' | 'pins' | 'likes' | 'bookmarks';

const Profile = () => {
  const navigate = useNavigate();
  const { nickTag } = useParams<{ nickTag?: string }>();
  const [searchParams] = useSearchParams();
  const currentUserId = useCurrentUserId();
  const { isAuthenticated, isLoading, login } = useAuth();

  // Читаем tab из URL query params (для редиректа после создания пина)
  const tabFromUrl = searchParams.get('tab') as TabType | null;

  // Определяем userId для загрузки данных
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  /* =======================
     UI state
  ======================= */

  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'collections');

  const [isEditOpen, setEditOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isFollowersOpen, setFollowersOpen] = useState(false);
  const [isFollowingOpen, setFollowingOpen] = useState(false);

  const [isFollowing, setFollowing] = useState(false);

  /* =======================
     Profile data
  ======================= */

  const [profileData, setProfileData] = useState({
    name: 'Jane Anderson',
    bio: 'The photographer capturing moments around the world based in Paris',
    avatar: placeholder_3,
    nickname: 'wanderlust_jane',
    followersCount: 0,
    followingCount: 0,
  });

  /* =======================
     Data state
  ======================= */

  const [pins, setPins] = useState<DisplayPin[]>([]);
  const [collections, setCollections] = useState<DisplayCollection[]>([]);

  const [likedPins, setLikedPins] = useState<DisplayPin[]>([]);
  const [likedCollections, setLikedCollections] = useState<DisplayCollection[]>([]);

  const [bookmarkedPins, setBookmarkedPins] = useState<DisplayPin[]>([]);
  const [bookmarkedCollections, setBookmarkedCollections] = useState<DisplayCollection[]>([]);

  // Подписчики и подписки просматриваемого профиля
  const [followers, setFollowers] = useState<DisplayUser[]>([]);
  const [following, setFollowingList] = useState<DisplayUser[]>([]);

  // Подписки ТЕКУЩЕГО пользователя (для правильного отображения кнопок)
  const [currentUserFollowing, setCurrentUserFollowing] = useState<string[]>([]);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, свой ли это профиль (по ID, не только по URL)
  const isOwnProfile = profileUserId !== null && profileUserId === currentUserId;

  /* =======================
     Effects (MUST be before any conditional returns!)
  ======================= */

  // Резолвим userId из nickTag или используем текущего пользователя
  useEffect(() => {
    const resolveUser = async () => {
      // Не выполняем эффект если ждём авторизации или нет данных
      if (!nickTag && !currentUserId) return;

      if (nickTag) {
        // Загружаем профиль другого пользователя по nickTag
        const user = await findUser({ nickTag });
        if (user) {
          setProfileUserId(user.id);
          setProfileData({
            name: user.nickname || 'Unknown',
            bio: user.description || '',
            avatar: user.profilePicture || placeholder_3,
            nickname: user.nickTag || nickTag,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0,
          });
          setFollowers(user.followers || []);
          setFollowingList(user.following || []);

          // Проверяем, подписан ли текущий пользователь на этот профиль
          if (currentUserId && user.followers) {
            const isFollowingProfile = user.followers.some(f => f.id === currentUserId);
            setFollowing(isFollowingProfile);
          }

          // Загружаем подписки ТЕКУЩЕГО пользователя для кнопок в модалках
          if (currentUserId) {
            const currentUser = await findUser({ id: currentUserId });
            if (currentUser?.following) {
              setCurrentUserFollowing(currentUser.following.map(f => f.id));
            }
          }
        } else {
          setError('Пользователь не найден');
        }
      } else if (currentUserId) {
        // Свой профиль - загружаем данные по ID
        setProfileUserId(currentUserId);

        // Загружаем данные профиля текущего пользователя
        const user = await findUser({ id: currentUserId });
        if (user) {
          setProfileData({
            name: user.nickname || 'Unknown',
            bio: user.description || '',
            avatar: user.profilePicture || placeholder_3,
            nickname: user.nickTag || 'user',
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0,
          });
          setFollowers(user.followers || []);
          setFollowingList(user.following || []);
          // Для своего профиля currentUserFollowing = своим подпискам
          setCurrentUserFollowing(user.following?.map(f => f.id) || []);
        }
      }
    };
    resolveUser();
  }, [nickTag, currentUserId]);

  // Загрузка данных при смене вкладки или userId
  useEffect(() => {
    if (!profileUserId) return;

    const loadTabData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === 'pins') {
          const response = await getPinsByUser({
            viewerId: currentUserId,
            userId: profileUserId,
            limit: 20,
            offset: 0,
          });

          if (response && response.length > 0) {
            // Сначала показываем пины БЕЗ локаций (мгновенно)
            const initialPins = response.map((pin: Pin) => {
              // Сортируем изображения по orderNumber чтобы взять первое
              const sortedImages = [...(pin.images || [])].sort(
                (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
              );
              return {
                id: pin.id,
                title: pin.name,
                image: sortedImages[0]?.imageUrl || getPlaceholderById(pin.id),
                location: '',
                author: profileData.nickname,
                authorAvatar: profileData.avatar,
                _lat: pin.latitude,
                _lon: pin.longitude,
              };
            });
            setPins(initialPins);
            setLoading(false);

            // Затем фоном подгружаем локации
            for (const pin of initialPins) {
              if (pin._lat && pin._lon) {
                getCityFromCoordinates(pin._lat, pin._lon).then(location => {
                  setPins(prev => prev.map(p =>
                    p.id === pin.id ? { ...p, location } : p
                  ));
                });
              }
            }
            return; // early return, setLoading уже вызван
          } else {
            setPins(mockPins);
          }
        }

        if (activeTab === 'collections') {
          const response = await getOwnBoardsByUser({
            userId: profileUserId,
            limit: 20,
            offset: 0,
          });

          if (response && response.length > 0) {
            // Сначала показываем коллекции БЕЗ локаций (мгновенно)
            const initialCollections = response.map((board: Board) => {
              // Берем первый пин и сортируем его изображения по orderNumber
              const firstPin = board.pins?.[0];
              const sortedImages = firstPin?.images
                ? [...firstPin.images].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
                : [];
              // Приоритет: boardImageURL > первый пин > placeholder
              const coverImage = (board as any).boardImageURL || sortedImages[0]?.imageUrl || getPlaceholderById(board.id);

              // Debug: выводим данные обложки
              console.log('[Profile] Board cover debug:', {
                boardId: board.id,
                boardName: board.name,
                boardImageURL: (board as any).boardImageURL,
                pinsCount: board.pins?.length,
                firstPin: firstPin ? { id: firstPin.id, name: firstPin.name, imagesCount: firstPin.images?.length } : null,
                firstPinFirstImage: sortedImages[0]?.imageUrl,
                finalCoverImage: coverImage,
              });

              return {
                id: board.id,
                title: board.name,
                location: '',
                image: coverImage,
                boardImageURL: (board as any).boardImageURL,
                pinsCount: board.pins?.length || 0,
                author: profileData.nickname,
                authorAvatar: profileData.avatar,
                _pins: board.pins || [],
              };
            });
            setCollections(initialCollections);
            setLoading(false);

            // Затем фоном подгружаем локации
            for (const col of initialCollections) {
              if (col._pins.length > 0) {
                getLocationForBoard(col._pins).then(location => {
                  setCollections(prev => prev.map(c =>
                    c.id === col.id ? { ...c, location } : c
                  ));
                });
              }
            }
            return; // early return, setLoading уже вызван
          } else {
            setCollections(mockCollections);
          }
        }

        if (activeTab === 'likes') {
          const response = await getLikesByUser({
            userId: profileUserId,
            pinsLimit: 20,
            pinsOffset: 0,
            boardsLimit: 10,
            boardsOffset: 0,
          });

          if (response) {
            setLikedPins(response.pins || []);
            setLikedCollections(response.boards || []);
          } else {
            setLikedPins(mockPins);
            setLikedCollections(mockCollections);
          }
        }

        if (activeTab === 'bookmarks') {
          const response = await getBookmarksByUser({
            userId: profileUserId,
            pinsLimit: 20,
            pinsOffset: 0,
            boardsLimit: 10,
            boardsOffset: 0,
          });

          if (response) {
            setBookmarkedPins(response.pins || []);
            setBookmarkedCollections(response.boards || []);
          } else {
            setBookmarkedPins(mockPins);
            setBookmarkedCollections(mockCollections);
          }
        }
      } catch (err) {
        console.error('[Profile] loadTabData error:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, profileUserId, profileData.nickname, currentUserId]);

  // Если пытаемся открыть /profile без nickTag и не авторизованы — показываем окно логина
  if (!nickTag && !isLoading && !isAuthenticated) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent} style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Требуется авторизация</h2>
          <p style={{ marginTop: '20px', color: '#666' }}>
            Войдите, чтобы просмотреть свой профиль
          </p>
          <button
            onClick={login}
            style={{
              marginTop: '30px',
              padding: '12px 40px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Войти
          </button>
        </main>
      </div>
    );
  }

  /* =======================
     Навигация
  ======================= */

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreatePin = () => navigate('/pin/create');
  const handleCreateCollection = () => navigate('/collection/create');

  const handlePinClick = (pinId: string) => {
    navigate(`/pin/${pinId}`);
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collection/${collectionId}`);
  };

  /* =======================
     Mixed feed (likes / bookmarks)
  ======================= */
  const generateMixedFeed = (
    collections: DisplayCollection[],
    pins: DisplayPin[]
  ) => {
    const COLLECTIONS_PER_BLOCK = 2;
    const PINS_PER_BLOCK = 5;

    const colls = [...collections];
    const ps = [...pins];

    const feed: { type: 'collections' | 'pins'; items: unknown[] }[] = [];
    let next: 'collections' | 'pins' = 'collections';

    while (colls.length || ps.length) {
      if (next === 'collections' && colls.length) {
        feed.push({
          type: 'collections',
          items: colls.splice(0, COLLECTIONS_PER_BLOCK),
        });
        next = 'pins';
      } else if (next === 'pins' && ps.length) {
        feed.push({
          type: 'pins',
          items: ps.splice(0, PINS_PER_BLOCK),
        });
        next = 'collections';
      } else {
        next = colls.length ? 'collections' : 'pins';
      }
    }

    return feed;
  };


  const likesFeed = generateMixedFeed(likedCollections, likedPins);
  const bookmarksFeed = generateMixedFeed(bookmarkedCollections, bookmarkedPins);


  /* =======================
     Render
  ======================= */

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn} />
          <h1>@{profileData.nickname}</h1>
        </div>

        <section className={styles.main_content}>
          <div style={{ display: "flex", width: "100%" }}>

            {/* Левая часть — профиль */}
            <div className={styles.profile}>
              <img src={profileData.avatar} className={styles.avatar} />

              <div className={styles.info}>
                <div className={styles.name}>{profileData.name}</div>

                <ul className={styles.follow_options}>
                  <li>
                    <button
                      className={styles.followLink}
                      onClick={() => setFollowersOpen(true)}
                    >
                      <p>{profileData.followersCount}</p> подписчиков
                    </button>
                  </li>

                  <li>
                    <button
                      className={styles.followLink}
                      onClick={() => setFollowingOpen(true)}
                    >
                      <p>{profileData.followingCount}</p> подписок
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Правая часть — кнопки */}
            <div
              className={styles.btn_container}
              style={{ display: "flex" }}
            >
              {isOwnProfile && (
                <>
                  <button
                    className={styles.edit_btn}
                    onClick={() => setEditOpen(true)}
                  >
                    Редактировать профиль
                  </button>

                  <button
                    className={styles.settingsBtn}
                    onClick={() => setSettingsOpen(true)}
                  />
                </>
              )}

              <button
                className={styles.shareBtn}
                onClick={() => setShareOpen(true)}
              />
            </div>

          </div>

          <div className={styles.bio}>{profileData.bio}</div>

          {/* Кнопка подписки только для чужих профилей */}
          {!isOwnProfile && profileUserId && (
            <div style={{ display: "flex" }}>
              <button
                className={styles.editBtn}
                onClick={async () => {
                  if (!profileUserId || !currentUserId) return;
                  try {
                    if (isFollowing) {
                      await unfollowUser(profileUserId, currentUserId);
                      setProfileData(prev => ({
                        ...prev,
                        followersCount: prev.followersCount - 1
                      }));
                      setCurrentUserFollowing(prev => prev.filter(id => id !== profileUserId));
                      // Убираем себя из списка подписчиков этого профиля
                      setFollowers(prev => prev.filter(f => f.id !== currentUserId));
                    } else {
                      await followUser(profileUserId, currentUserId);
                      setProfileData(prev => ({
                        ...prev,
                        followersCount: prev.followersCount + 1
                      }));
                      setCurrentUserFollowing(prev => [...prev, profileUserId]);
                      // Добавляем себя в список подписчиков этого профиля
                      const currentUser = await findUser({ id: currentUserId });
                      if (currentUser) {
                        setFollowers(prev => [...prev, {
                          id: currentUser.id,
                          nickname: currentUser.nickname || '',
                          nickTag: currentUser.nickTag || '',
                          profilePicture: currentUser.profilePicture
                        }]);
                      }
                    }
                    setFollowing(prev => !prev);
                  } catch (err) {
                    console.error('Follow/unfollow error:', err);
                  }
                }}
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
          )}
        </section>


        {/* Tabs */}
        <div className={styles.tabs}>
          {(['collections', 'pins', 'likes', 'bookmarks'] as TabType[]).map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${
                activeTab === tab ? styles.active : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {{
                collections: 'Подборки',
                pins: 'Пины',
                likes: 'Понравившиеся',
                bookmarks: 'Закладки',
              }[tab]}
            </button>
          ))}
        </div>

        {loading && <p className={styles.loading}>Загрузка…</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.tabContent}>
          {activeTab === 'collections' && (
            <>
              <button
                onClick={handleCreateCollection}
                className={styles.newBoardBtn}
              >
                Создать подборку
              </button>

              <CollectionGrid
                collections={collections.map(col => ({
                  ...col,
                  authorAvatar: col.authorAvatar || placeholder_1,
                }))}
                onCollectionClick={handleCollectionClick}
              />
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

              <PinGrid pins={pins} onPinClick={handlePinClick} />
            </>
          )}

          {activeTab === 'likes' && (
            <div className={styles.likesFeed}>
              {likesFeed.map((block, idx) => (
                <div key={idx} className={styles.feedBlock}>
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
          )}

          {activeTab === 'bookmarks' && (
            <div className={styles.likesFeed}>
              {bookmarksFeed.map((block, idx) => (
                <div key={idx} className={styles.feedBlock}>
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
          )}
        </div>



        {/* Modals */}
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          onSave={async (data) => {
            if (!currentUserId) return;
            try {
              // Сохраняем в БД (аватарка передаётся как base64)
              const result = await updateUser(currentUserId, {
                nickname: data.name,
                nick_tag: data.nickname,
                description: data.bio,
                profilePicture: data.avatar,
              });
              console.log('[Profile] updateUser result:', result);
              // Обновляем локальное состояние
              setProfileData(prev => ({
                ...prev,
                name: data.name,
                nickname: data.nickname,
                bio: data.bio,
                avatar: data.avatar,
              }));
            } catch (error) {
              console.error('Failed to update profile:', error);
            }
          }}
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
          onSubmit={() => { /* TODO: implement report functionality */ }}
        />

        <FollowersModal
          isOpen={isFollowersOpen}
          onClose={() => setFollowersOpen(false)}
          followers={followers}
          currentUserFollowing={currentUserFollowing}
          onFollowChange={(userId, isNowFollowing) => {
            // Обновляем локальный список подписок текущего пользователя
            if (isNowFollowing) {
              setCurrentUserFollowing(prev => [...prev, userId]);
              // Если это свой профиль, добавляем пользователя в список подписок
              if (isOwnProfile) {
                const followedUser = followers.find(f => f.id === userId);
                if (followedUser) {
                  setFollowingList(prev => [...prev, followedUser]);
                  setProfileData(prev => ({
                    ...prev,
                    followingCount: prev.followingCount + 1
                  }));
                }
              }
            } else {
              setCurrentUserFollowing(prev => prev.filter(id => id !== userId));
              // Если это свой профиль, убираем пользователя из списка подписок
              if (isOwnProfile) {
                setFollowingList(prev => prev.filter(f => f.id !== userId));
                setProfileData(prev => ({
                  ...prev,
                  followingCount: prev.followingCount - 1
                }));
              }
            }
          }}
        />

        <FollowingModal
          isOpen={isFollowingOpen}
          onClose={() => setFollowingOpen(false)}
          following={following}
          isOwnProfile={isOwnProfile}
          currentUserFollowing={currentUserFollowing}
          onUnfollow={(userId) => {
            setFollowingList(prev => prev.filter(f => f.id !== userId));
            setCurrentUserFollowing(prev => prev.filter(id => id !== userId));
            setProfileData(prev => ({
              ...prev,
              followingCount: prev.followingCount - 1
            }));
          }}
          onFollowChange={(userId, isNowFollowing) => {
            // Обновляем локальный список подписок текущего пользователя
            // Примечание: для своего профиля отписка обрабатывается в onUnfollow,
            // здесь только подписка
            if (isNowFollowing) {
              setCurrentUserFollowing(prev => [...prev, userId]);
              if (isOwnProfile) {
                const followedUser = following.find(f => f.id === userId);
                if (followedUser) {
                  setFollowingList(prev => [...prev, followedUser]);
                  setProfileData(prev => ({
                    ...prev,
                    followingCount: prev.followingCount + 1
                  }));
                }
              }
            } else {
              setCurrentUserFollowing(prev => prev.filter(id => id !== userId));
              // Для своего профиля onUnfollow уже обрабатывает список и счётчик
            }
          }}
        />
      </main>
    </div>
  );
};

export default Profile;
