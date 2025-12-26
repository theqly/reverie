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

import { getCityFromCoordinates } from '../services/geoService';

type TabType = 'collections' | 'pins' | 'likes' | 'bookmarks';

const USER_ID = '00000000-0000-0000-0000-000000000001';

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
     Utils
  ======================= */

  const enrichPinsWithLocation = async (sourcePins: any[]) => {
    return Promise.all(
      sourcePins.map(async (pin) => {
        let location = '';

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
          location,
        };
      })
    );
  };

  /* =======================
     Navigation
  ======================= */

  const handleBack = () => navigate(-1);
  const handleCreatePin = () => navigate('/pin/create');
  const handleCreateCollection = () => navigate('/collection/create');

  const handlePinClick = (pinId: string) =>
    navigate(`/pin/${pinId}`);

  const handleCollectionClick = (collectionId: string) =>
    navigate(`/collection/${collectionId}`);

  /* =======================
     Data loading
  ======================= */

  const handleGetPins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPinsByUser({
        viewerId: USER_ID,
        userId: USER_ID,
        limit: 20,
        offset: 0,
      });

      const sourcePins =
        response && response.length > 0 ? response : mockPins;

      const enriched = await enrichPinsWithLocation(sourcePins);
      setPins(enriched);
    } catch (err) {
      console.error('[Profile] getPins error:', err);
      setPins(await enrichPinsWithLocation(mockPins));
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
        userId: USER_ID,
        limit: 20,
        offset: 0,
      });

      setCollections(
        response && response.length > 0 ? response : mockCollections
      );
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
        userId: USER_ID,
        pinsLimit: 20,
        pinsOffset: 0,
        boardsLimit: 10,
        boardsOffset: 0,
      });

      const pinsSrc = response?.pins?.length
        ? response.pins
        : mockPins;

      setLikedPins(await enrichPinsWithLocation(pinsSrc));
      setLikedCollections(response?.boards || mockCollections);
    } catch (err) {
      console.error('[Profile] getLikes error:', err);
      setLikedPins(await enrichPinsWithLocation(mockPins));
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
        userId: USER_ID,
        pinsLimit: 20,
        pinsOffset: 0,
        boardsLimit: 10,
        boardsOffset: 0,
      });

      const pinsSrc = response?.pins?.length
        ? response.pins
        : mockPins;

      setBookmarkedPins(await enrichPinsWithLocation(pinsSrc));
      setBookmarkedCollections(response?.boards || mockCollections);
    } catch (err) {
      console.error('[Profile] getBookmarks error:', err);
      setBookmarkedPins(await enrichPinsWithLocation(mockPins));
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
    if (activeTab === 'pins') handleGetPins();
    if (activeTab === 'collections') handleGetCollections();
    if (activeTab === 'likes') handleGetLikes();
    if (activeTab === 'bookmarks') handleGetBookmarks();
  }, [activeTab]);

  /* =======================
     Transform for grids
  ======================= */

  const transformPinsForGrid = (pinsData: any[]) =>
    pinsData.map(pin => ({
      ...pin,
      image: placeholder_1,
      title: pin.name || pin.title,
      location: pin.location,
    }));

  const transformCollectionsForGrid = (collectionsData: any[]) =>
    collectionsData.map(col => ({
      ...col,
      image: placeholder_1,
      title: col.name || col.title,
      pinsCount: col.pinsCount || 0,
    }));

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
          <div style={{ display: 'flex', width: '100%' }}>
            <div className={styles.profile}>
              <img src={profileData.avatar} className={styles.avatar} />
              <div className={styles.info}>
                <div className={styles.name}>{profileData.name}</div>
              </div>
            </div>
          </div>

          <div className={styles.bio}>{profileData.bio}</div>
        </section>

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
              <button onClick={handleCreateCollection} className={styles.newBoardBtn}>
                Создать подборку
              </button>
              <CollectionGrid
                collections={transformCollectionsForGrid(collections)}
                onCollectionClick={handleCollectionClick}
              />
            </>
          )}

          {activeTab === 'pins' && (
            <>
              <button onClick={handleCreatePin} className={styles.newPinBtn}>
                Создать пин
              </button>
              <PinGrid
                pins={transformPinsForGrid(pins)}
                onPinClick={handlePinClick}
              />
            </>
          )}

          {activeTab === 'likes' && (
            <PinGrid
              pins={transformPinsForGrid(likedPins)}
              onPinClick={handlePinClick}
            />
          )}

          {activeTab === 'bookmarks' && (
            <PinGrid
              pins={transformPinsForGrid(bookmarkedPins)}
              onPinClick={handlePinClick}
            />
          )}
        </div>

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
