import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import Header from './Header';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_1 from '../assets/placeholder1.jpg';
import EditProfileModal from './EditProfileModal';
import SettingsModal from "./SettingsModal";
import ShareModal from "./ShareModal";
import ReportModal from "./ReportModal";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";
import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';
import { mockPins, mockCollections } from '../utils/mockData';

const Profile = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isFollowersOpen, setFollowersOpen] = useState(false);
  const [isFollowingOpen, setFollowingOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Jane Anderson",
    bio: "The photographer capturing moments around the world based in Paris",
    avatar: placeholder_3,
    nickname: "dsfsd"
  });

  // Подписка / отписка
  const [isFollowing, setFollowing] = useState(false);
  const toggleFollow = () => setFollowing(prev => !prev);

  const [activeTab, setActiveTab] = useState<'collections' | 'pins' | 'likes' | 'bookmarks'>('collections');

  const handleBack = () => {
    window.history.back();
  };

  // Используем данные из mockData
  const pins = mockPins;
  const collections = mockCollections.map(col => ({
    ...col,
    // Добавляем автора для совместимости с CollectionGridItem
    author: col.author || "jane_anderson",
    authorAvatar: col.authorAvatar || placeholder_1
  }));

  const handleCreateCollection = () => {
    navigate('/collection/create');
  };

  const handleCreatePin = () => {
    navigate('/pin/create');
  };

  // Функция для формирования ленты (лайки и закладки)
  const generateMixedFeed = () => {
    const COLLECTIONS_PER_BLOCK = 2;
    const PINS_PER_BLOCK = 5;

    const colls = [...collections];
    const ps = [...pins];
    const feed: { type: 'collections' | 'pins'; items: any[] }[] = [];

    let next = 'collections' as 'collections' | 'pins';

    while (colls.length > 0 || ps.length > 0) {
      if (next === 'collections' && colls.length > 0) {
        const batch = colls.splice(0, COLLECTIONS_PER_BLOCK);
        feed.push({ type: 'collections', items: batch });
        next = 'pins';
      } else if (next === 'pins' && ps.length > 0) {
        const batch = ps.splice(0, PINS_PER_BLOCK);
        feed.push({ type: 'pins', items: batch });
        next = 'collections';
      } else {
        next = colls.length > 0 ? 'collections' : 'pins';
      }
    }

    return feed;
  };

  const mixedFeed = generateMixedFeed();

  return (
    <div className={styles.createCollectionPage}>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn}></button>
          <h1>@wanderlust_jane</h1>
        </div>

        <section className={styles.main_content}>
          <div style={{ display: "flex", width: "100%"}}>

            <div className={styles.profile}>
              <img src={profileData.avatar} className={styles.avatar} />

              <div className={styles.info}>
                <div className={styles.name}>{profileData.name}</div>
                <ul className={styles.follow_options}>
                  <li>
                    <button className={styles.followLink} onClick={() => setFollowersOpen(true)}>
                      <p>1247</p> подписчиков
                    </button>
                  </li>

                  <li>
                    <button className={styles.followLink} onClick={() => setFollowingOpen(true)}>
                      <p>450</p> подписок
                    </button>
                  </li>

                </ul>
              </div>
            </div>

            <div className={styles.btn_container} style={{ display: "flex" }}>
              <button 
                className={styles.edit_btn}
                onClick={() => setModalOpen(true)}
              >
                Редактировать профиль
              </button>

              <button 
                className={styles.settingsBtn}
                onClick={() => setSettingsOpen(true)}
              ></button>

              <button 
                className={styles.shareBtn}
                onClick={() => setShareOpen(true)}
              ></button>

            </div>

          </div>

          <div className={styles.bio}>{profileData.bio}</div>

          <div style={{ display: "flex" }}>
            <button 
              className={styles.editBtn}
              onClick={toggleFollow}
            >
              {isFollowing ? "Отписаться" : "Подписаться"}
            </button>
            <button className={styles.reportBtn} onClick={() => setReportOpen(true)}>!</button>
          </div>

        </section>

        {/* ---------------------- ВКЛАДКИ ---------------------- */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'collections' ? styles.active : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            Подборки
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'pins' ? styles.active : ''}`}
            onClick={() => setActiveTab('pins')}
          >
            Пины
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'likes' ? styles.active : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Понравившиеся
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'bookmarks' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Закладки
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'collections' && (
            <div>
              <button onClick={handleCreateCollection} className={styles.newBoardBtn}>
                Создать подборку
              </button>
              
              <CollectionGrid 
                collections={collections} 
                onCollectionClick={(collectionId) => navigate(`/collection/${collectionId}`)}
              />
            </div>
          )}

          {activeTab === 'pins' && (
            <div>
              <button onClick={handleCreatePin} className={styles.newPinBtn}>
                Создать пин
              </button>
              
              <PinGrid 
                pins={pins} 
                onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
              />
            </div>
          )}

          {activeTab === 'likes' && (
            <div className={styles.likesFeed}>
              {mixedFeed.map((block, idx) => (
                <div key={idx} className={styles.feedBlock}>
                  {block.type === 'collections' && (
                    <CollectionGrid 
                      collections={block.items} 
                      onCollectionClick={(collectionId) => navigate(`/collection/${collectionId}`)}
                    />
                  )}

                  {block.type === 'pins' && (
                    <PinGrid 
                      pins={block.items} 
                      onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className={styles.likesFeed}>
              {mixedFeed.map((block, idx) => (
                <div key={idx} className={styles.feedBlock}>
                  {block.type === 'collections' && (
                    <CollectionGrid 
                      collections={block.items} 
                      onCollectionClick={(collectionId) => navigate(`/collection/${collectionId}`)}
                    />
                  )}

                  {block.type === 'pins' && (
                    <PinGrid 
                      pins={block.items} 
                      onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(data) => setProfileData(data)}
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
          onSubmit={(data) => {
            console.log("Жалоба отправлена:", data);
          }}
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