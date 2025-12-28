import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_1 from '../assets/placeholder1.jpg';
import {getUserIdFromToken} from '../auth/tokenStorage';


import { mockPins, mockCollections } from '../utils/mockData';
import {
  findUser,
  getPinsByUser,
  getOwnBoardsByUser,
  getLikesByUser,
  getBookmarksByUser,
  updateUser,
} from '../services/profileService';

import { getCityFromCoordinates } from '../services/geoService';

type TabType = 'collections' | 'pins' | 'likes' | 'bookmarks';

interface UserData {
  id: string;
  nickname: string;
  name?: string;
  email: string;
  nickTag: string;
  profilePicture?: string;
  description?: string;
  userRating: number;
  followers: Array<{ id: string; nickname: string }>;
  following: Array<{ id: string; nickname: string }>;
}

const Profile = () => {
  const navigate = useNavigate();

  /* =======================
     UI state
  ======================= */

  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [isEditOpen, setEditOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isFollowersOpen, setFollowersOpen] = useState(false);
  const [isFollowingOpen, setFollowingOpen] = useState(false);

  /* =======================
     Profile data
  ======================= */

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFollowing, setFollowing] = useState(false);
  
  // Для модалки редактирования
  const [editFormData, setEditFormData] = useState({
    nickname: '',
    name: '',
    description: '',
    nickTag: '',
  });

  /* =======================
     Data state
  ======================= */

  const [pins, setPins] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [likedPins, setLikedPins] = useState<any[]>([]);
  const [likedCollections, setLikedCollections] = useState<any[]>([]);
  const [bookmarkedPins, setBookmarkedPins] = useState<any[]>([]);
  const [bookmarkedCollections, setBookmarkedCollections] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Константы для ID пользователей
  ======================= */
  const TEMP_USER_ID = String(getUserIdFromToken());
  const TEMP_VIEWER_ID = '00000000-0000-0000-0000-000000000001';

  /* =======================
     Навигация
  ======================= */

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreatePin = () => navigate('/pin/create');
  const handleCreateCollection = () => navigate('/collection/create');

  const handlePinClick = (pinId: string, ownerId: string) => {
    navigate(`/pin/${pinId}?ownerId=${ownerId}`);
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collection/${collectionId}`);
  };

  /* =======================
     Загрузка профиля пользователя
  ======================= */

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      console.log("Загружаем данные профиля пользователя...");
      const user = await findUser({ id: TEMP_USER_ID });
      
      if (user) {
        console.log("Данные пользователя получены:", user);
        setUserData(user as UserData);
        
        // Устанавливаем данные для формы редактирования
        setEditFormData({
          nickname: user.nickname || '',
          name: user.name || user.nickname || '',
          description: user.description || '',
          nickTag: user.nickTag || '',
        });
      } else {
        console.log("Пользователь не найден");
        setError('Пользователь не найден');
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setError('Не удалось загрузить профиль');
    } finally {
      setLoadingProfile(false);
    }
  };

  /* =======================
     Обработка сохранения профиля
  ======================= */

  const handleSaveProfile = async (data: any) => {
    try {
      console.log("Сохранение профиля:", data);
      
      // Вызываем API для обновления пользователя
      const updatedUser = await updateUser(TEMP_USER_ID, {
        nickname: data.nickname,
        name: data.name,
        description: data.description,
        // Добавьте другие поля при необходимости
      });
      
      if (updatedUser) {
        // Обновляем локальные данные
        setUserData(updatedUser as UserData);
        setEditFormData({
          nickname: updatedUser.nickname || '',
          name: updatedUser.name || updatedUser.nickname || '',
          description: updatedUser.description || '',
          nickTag: updatedUser.nickTag || '',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      return false;
    }
  };

  /* =======================
     Загрузка данных (используем реальные ID)
  ======================= */

  const handleGetPins = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getPinsByUser({
        viewerId: TEMP_VIEWER_ID,
        userId: userData.id,
        limit: 20,
        offset: 0,
      });

      if (response && response.length > 0) {
        const pinsWithLocation = await Promise.all(
          response.map(async (pin) => {
            let location = '';
            if (pin.latitude && pin.longitude) {
              try {
                location = await getCityFromCoordinates(
                  pin.latitude,
                  pin.longitude
                );
              } catch (e) {
                console.warn('Не удалось определить город для пина', e);
              }
            }
            
            const imageUrl = pin.images && pin.images[0] && pin.images[0].imageUrl
              ? pin.images[0].imageUrl
              : pin.imageUrl || placeholder_1;
            
            return {
              ...pin,
              id: pin.id,
              title: pin.name || pin.title || 'Без названия',
              description: pin.description || '',
              image: imageUrl,
              author: userData.nickname,
              authorAvatar: userData.profilePicture || placeholder_1,
              likes: pin.rating || pin.likes || 0,
              location: location || 'Не указано',
              createdAt: pin.createdAt,
              latitude: pin.latitude,
              longitude: pin.longitude
            };
          })
        );
        setPins(pinsWithLocation);
      } else {
        console.log('[Profile] Использовали моки пинов');
        const formattedMockPins = mockPins.map(pin => ({
          ...pin,
          image: placeholder_1,
          author: userData?.nickname || 'jane_anderson',
          authorAvatar: userData?.profilePicture || placeholder_1,
          location: pin.location || 'Не указано'
        }));
        setPins(formattedMockPins);
      }
    } catch (err) {
      console.error('[Profile] getPins error:', err);
      const formattedMockPins = mockPins.map(pin => ({
        ...pin,
        image: placeholder_1,
        author: userData?.nickname || 'jane_anderson',
        authorAvatar: userData?.profilePicture || placeholder_1,
        location: pin.location || 'Не указано'
      }));
      setPins(formattedMockPins);
      setError('Не удалось загрузить пины');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCollections = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getOwnBoardsByUser({
        userId: userData.id,
        limit: 20,
        offset: 0,
      });

      if (response && response.length > 0) {
        const formattedCollections = response.map(col => ({
          ...col,
          id: col.id,
          title: col.name || 'Без названия',
          description: col.description || '',
          image: col.boardImageURL || col.image || placeholder_1,
          author: userData.nickname,
          authorAvatar: userData.profilePicture || placeholder_1,
          pinsCount: col.pins ? col.pins.length : 0,
          likes: col.rating || 0,
          createdAt: col.createdAt,
          accessLevel: col.accessLevel,
          ownerId: col.ownerId
        }));
        setCollections(formattedCollections);
      } else {
        console.log('[Profile] Использовали моки подборок');
        const formattedMockCollections = mockCollections.map(col => ({
          ...col,
          image: placeholder_1,
          author: userData.nickname,
          authorAvatar: userData.profilePicture || placeholder_1,
          pinsCount: col.pinsCount || 0
        }));
        setCollections(formattedMockCollections);
      }
    } catch (err) {
      console.error('[Profile] getCollections error:', err);
      const formattedMockCollections = mockCollections.map(col => ({
        ...col,
        image: placeholder_1,
        author: userData?.nickname || 'jane_anderson',
        authorAvatar: userData?.profilePicture || placeholder_1,
        pinsCount: col.pinsCount || 0
      }));
      setCollections(formattedMockCollections);
      setError('Не удалось загрузить подборки');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLikes = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getLikesByUser({
        userId: userData.id,
        pinsLimit: 20,
        pinsOffset: 0,
        boardsLimit: 10,
        boardsOffset: 0,
      });

      if (response) {
        setLikedPins(response.pins || []);
        setLikedCollections(response.boards || []);
      } else {
        console.log('[Profile] Лайки не найдены');
        setLikedPins([]);
        setLikedCollections([]);
      }
    } catch (err) {
      console.error('[Profile] getLikes error:', err);
      setLikedPins([]);
      setLikedCollections([]);
      setError('Не удалось загрузить лайки');
    } finally {
      setLoading(false);
    }
  };

  const handleGetBookmarks = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getBookmarksByUser({
        userId: userData.id,
        pinsLimit: 20,
        pinsOffset: 0,
        boardsLimit: 10,
        boardsOffset: 0,
      });

      if (response) {
        setBookmarkedPins(response.pins || []);
        setBookmarkedCollections(response.boards || []);
      } else {
        console.log('[Profile] Закладки не найдены');
        setBookmarkedPins([]);
        setBookmarkedCollections([]);
      }
    } catch (err) {
      console.error('[Profile] getBookmarks error:', err);
      setBookmarkedPins([]);
      setBookmarkedCollections([]);
      setError('Не удалось загрузить закладки');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Effects
  ======================= */

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userData) {
      if (activeTab === 'pins') {
        handleGetPins();
      } else if (activeTab === 'collections') {
        handleGetCollections();
      } else if (activeTab === 'likes') {
        handleGetLikes();
      } else if (activeTab === 'bookmarks') {
        handleGetBookmarks();
      }
    }
  }, [activeTab, userData]);

  /* =======================
     Вспомогательные функции
  ======================= */

  const getFollowersCount = () => {
    return userData?.followers?.length || 0;
  };

  const getFollowingCount = () => {
    return userData?.following?.length || 0;
  };

  const getUserRating = () => {
    return userData?.userRating || 0;
  };

  const getProfilePicture = () => {
    return userData?.profilePicture || placeholder_3;
  };

  const getNickname = () => {
    return userData?.nickname || 'user';
  };
    
  const getNickTag = () => {
    return userData?.nickTag || 'user';
  };

  const getName = () => {
    return userData?.name || userData?.nickname || 'Без имени';
  };

  const getBio = () => {
    return userData?.description || 'Нет описания';
  };

  /* =======================
     Mixed feed (likes / bookmarks)
  ======================= */

  const generateMixedFeed = (collections: any[], pins: any[]) => {
    const COLLECTIONS_PER_BLOCK = 2;
    const PINS_PER_BLOCK = 5;

    const colls = [...collections];
    const ps = [...pins];
    const feed: { type: 'collections' | 'pins'; items: any[] }[] = [];
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

  const getImageUrl = (item: any) => {
    if (item.image) return item.image;
    if (item.images && item.images[0] && item.images[0].imageUrl) {
      return item.images[0].imageUrl;
    }
    if (item.imageUrl) {
      return item.imageUrl;
    }
    if (item.boardImageURL) {
      return item.boardImageURL;
    }
    return placeholder_1;
  };

  /* =======================
     Render состояния загрузки
  ======================= */

  if (loadingProfile) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.loadingContainer}>
            <p>Загрузка профиля...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.createCollectionPage}>
        <Header />
        <main className={styles.collectionContent}>
          <div className={styles.errorContainer}>
            <h2>Профиль не найден</h2>
            <p>{error || 'Не удалось загрузить данные профиля'}</p>
            <button onClick={() => navigate('/feed')} className={styles.backButton}>
              Вернуться на главную
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =======================
     Render
  ======================= */

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn} />
          <h1>@{getNickTag()}</h1>
          <div className={styles.hidden}>
            Рейтинг: {getUserRating().toFixed(1)} ⭐
          </div>
        </div>

        <section className={styles.main_content}>
          <div style={{ display: "flex", width: "100%" }}>

            {/* Левая часть — профиль */}
            <div className={styles.profile}>
              <img src={getProfilePicture()} className={styles.avatar} alt={getName()} />

              <div className={styles.info}>
                <div className={styles.name}>{getName()}</div>

                <ul className={styles.follow_options}>
                  <li>
                    <button
                      className={styles.followLink}
                      onClick={() => setFollowersOpen(true)}
                    >
                      <p>{getFollowersCount()}</p> подписчиков
                    </button>
                  </li>

                  <li>
                    <button
                      className={styles.followLink}
                      onClick={() => setFollowingOpen(true)}
                    >
                      <p>{getFollowingCount()}</p> подписок
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Правая часть — кнопки */}
            <div className={styles.btn_container} style={{ display: "flex" }}>
              <button
                className={styles.edit_btn}
                onClick={() => setEditOpen(true)}
              >
                Редактировать профиль
              </button>

              <button
                className={styles.settingsBtn}
                onClick={() => setSettingsOpen(true)}
                title="Настройки"
              />

              <button
                className={styles.shareBtn}
                onClick={() => setShareOpen(true)}
                title="Поделиться профилем"
              />
            </div>

          </div>

          <div className={styles.bio}>{getBio()}</div>

          <div style={{ display: "flex" }}>
            <button
              className={styles.editBtn}
              onClick={() => setFollowing(prev => !prev)}
            >
              {isFollowing ? 'Отписаться' : 'Подписаться'}
            </button>

            <button
              className={styles.reportBtn}
              onClick={() => setReportOpen(true)}
              title="Пожаловаться на профиль"
            >
              !
            </button>
          </div>
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
                  image: getImageUrl(col),
                  authorAvatar: getProfilePicture(),
                  title: col.name || col.title || 'Без названия',
                  pinsCount: col.pinsCount || (col.pins ? col.pins.length : 0),
                  description: col.description || '',
                  author: getNickTag()
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

              <PinGrid 
                pins={pins.map(pin => ({
                  ...pin,
                  image: getImageUrl(pin),
                  title: pin.name || pin.title || 'Без названия',
                  author: getNickTag(),
                  authorAvatar: getProfilePicture(),
                  location: pin.location || 'Не указано',
                  likes: pin.rating || pin.likes || 0
                }))} 
                onPinClick={handlePinClick} 
              />
            </>
          )}

          {activeTab === 'likes' && (
            <div className={styles.likesFeed}>
              {likesFeed.length > 0 ? (
                likesFeed.map((block, idx) => (
                  <div key={idx} className={styles.feedBlock}>
                    {block.type === 'collections' ? (
                      <CollectionGrid
                        collections={block.items.map(col => ({
                          ...col,
                          image: getImageUrl(col),
                          authorAvatar: placeholder_1,
                          title: col.name || col.title || 'Без названия'
                        }))}
                        onCollectionClick={handleCollectionClick}
                      />
                    ) : (
                      <PinGrid
                        pins={block.items.map(pin => ({
                          ...pin,
                          image: getImageUrl(pin),
                          authorAvatar: placeholder_1,
                          title: pin.name || pin.title || 'Без названия'
                        }))}
                        onPinClick={handlePinClick}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>У вас пока нет лайков</p>
                  <p className={styles.emptyStateSubtitle}>
                    Отмечайте понравившиеся пины и подборки сердечком ❤️
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className={styles.likesFeed}>
              {bookmarksFeed.length > 0 ? (
                bookmarksFeed.map((block, idx) => (
                  <div key={idx} className={styles.feedBlock}>
                    {block.type === 'collections' ? (
                      <CollectionGrid
                        collections={block.items.map(col => ({
                          ...col,
                          image: getImageUrl(col),
                          authorAvatar: placeholder_1,
                          title: col.name || col.title || 'Без названия'
                        }))}
                        onCollectionClick={handleCollectionClick}
                      />
                    ) : (
                      <PinGrid
                        pins={block.items.map(pin => ({
                          ...pin,
                          image: getImageUrl(pin),
                          authorAvatar: placeholder_1,
                          title: pin.name || pin.title || 'Без названия'
                        }))}
                        onPinClick={handlePinClick}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>У вас пока нет закладок</p>
                  <p className={styles.emptyStateSubtitle}>
                    Сохраняйте интересные пины и подборки в закладки для быстрого доступа 📌
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
          initialData={editFormData}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setShareOpen(false)}
          profileUrl={`${window.location.origin}/profile/${userData.id}`}
          profileName={getName()}
        />

        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={data => console.log('Жалоба:', data)}
        />

        <FollowersModal
          isOpen={isFollowersOpen}
          onClose={() => setFollowersOpen(false)}
          followers={userData.followers || []}
        />

        <FollowingModal
          isOpen={isFollowingOpen}
          onClose={() => setFollowingOpen(false)}
          following={userData.following || []}
        />
      </main>
    </div>
  );
};

export default Profile;