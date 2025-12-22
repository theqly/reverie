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

import { mockPins, mockCollections } from '../utils/mockData';
import {
  getPinsByUser,
  getOwnBoardsByUser,
  getLikesByUser,
  getBookmarksByUser,
} from '../services/profileService';


type TabType = 'collections' | 'pins' | 'likes' | 'bookmarks';

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

  const [isFollowing, setFollowing] = useState(false);

  /* =======================
     Profile data
  ======================= */

  const [profileData, setProfileData] = useState({
    name: 'Jane Anderson',
    bio: 'The photographer capturing moments around the world based in Paris',
    avatar: placeholder_3,
    nickname: 'wanderlust_jane',
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
  const [error, setError] = useState<string | null>(null);

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
     Загрузка данных
     (ТОЧНО как в Feed)
  ======================= */

  const handleGetPins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPinsByUser({
        viewerId: '000', // временно
        userId: '000',   // временно
        limit: 20,
        offset: 0,
      });

      if (response && response.length > 0) {
        setPins(response);
      } else {
        console.log('[Profile] Использовали моки пинов');
        setPins(mockPins);
      }
    } catch (err) {
      console.error('[Profile] getPins error:', err);
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
        console.log('[Profile] Использовали моки подборок');
        setCollections(mockCollections);
      }
    } catch (err) {
      console.error('[Profile] getCollections error:', err);
      setCollections(mockCollections);
      setError('Не удалось загрузить подборки');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLikes = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await getLikesByUser({
      userId: '000', // временно
      pinsLimit: 20,
      pinsOffset: 0,
      boardsLimit: 10,
      boardsOffset: 0,
    });

    if (response) {
      setLikedPins(response.pins || []);
      setLikedCollections(response.boards || []);
    } else {
      console.log('[Profile] Использовали моки лайков');
      setLikedPins(mockPins);
      setLikedCollections(mockCollections);
    }
  } catch (err) {
    console.error('[Profile] getLikes error:', err);
    setLikedPins(mockPins);
    setLikedCollections(mockCollections);
    setError('Не удалось загрузить лайки');
  } finally {
    setLoading(false);
  }
};

const handleGetBookmarks = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await getBookmarksByUser({
      userId: '000', // временно
      pinsLimit: 20,
      pinsOffset: 0,
      boardsLimit: 10,
      boardsOffset: 0,
    });

    if (response) {
      setBookmarkedPins(response.pins || []);
      setBookmarkedCollections(response.boards || []);
    } else {
      console.log('[Profile] Использовали моки закладок');
      setBookmarkedPins(mockPins);
      setBookmarkedCollections(mockCollections);
    }
  } catch (err) {
    console.error('[Profile] getBookmarks error:', err);
    setBookmarkedPins(mockPins);
    setBookmarkedCollections(mockCollections);
    setError('Не удалось загрузить закладки');
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

    if (activeTab === 'likes') {
    handleGetLikes();
    }

    if (activeTab === 'bookmarks') {
      handleGetBookmarks();
    }
  }, [activeTab]);

  /* =======================
     Mixed feed (likes / bookmarks)
  ======================= */
  const generateMixedFeed = (
    collections: any[],
    pins: any[]
  ) => {
    const COLLECTIONS_PER_BLOCK = 2;
    const PINS_PER_BLOCK = 5;

    //console.log('collections:', collections);


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

            {/* Правая часть — кнопки */}
            <div
              className={styles.btn_container}
              style={{ display: "flex" }}
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
              />

              <button
                className={styles.shareBtn}
                onClick={() => setShareOpen(true)}
              />
            </div>

          </div>

          <div className={styles.bio}>{profileData.bio}</div>

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
          onSubmit={data => console.log('Жалоба:', data)}
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
