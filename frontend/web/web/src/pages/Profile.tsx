import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import Header from './Header';
import placeholder from '../assets/placeholder.jpg';
import placeholder_1 from '../assets/placeholder1.jpg';
import placeholder_2 from '../assets/placeholder2.jpg';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_4 from '../assets/placeholder4.jpg';
import placeholder_6 from '../assets/placeholder6.jpg';
import placeholder_7 from '../assets/placeholder7.jpg';
import placeholder_8 from '../assets/placeholder8.jpg';
import placeholder_9 from '../assets/placeholder9.jpg';
import placeholder_10 from '../assets/placeholder10.jpg';
import EditProfileModal from './EditProfileModal';
import SettingsModal from "./SettingsModal";
import ShareModal from "./ShareModal";
import ReportModal from "./ReportModal";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";


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

  /*
  const pins = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    image: placeholder,
    title: `Cafe le cafe delacrua`,
    location: `Location ${i + 1}`
  })); */
  // Заглушка для пинов с разными данными
  const pins = [
    {
      id: 1,
      image: placeholder_9,
      title: "Cafe le cafe delacrua",
      location: "Paris, France",
      author: "jane_anderson",
      authorAvatar: placeholder_1
    },
    {
      id: 2,
      image: placeholder_2,
      title: "Morning in the mountains",
      location: "Chamonix, France",
      author: "alex_smith",
      authorAvatar: placeholder_2
    },
    {
      id: 3,
      image: placeholder_3,
      title: "Sunset by the lake",
      location: "Lake Tahoe, USA",
      author: "emily_jones",
      authorAvatar: placeholder_3
    },
    {
      id: 4,
      image: placeholder_4,
      title: "City lights at night",
      location: "New York, USA",
      author: "michael_lee",
      authorAvatar: placeholder_4
    },
    {
      id: 6,
      image: placeholder_6,
      title: "Ocean waves",
      location: "Malibu, USA",
      author: "liam_wilson",
      authorAvatar: placeholder_6
    },
    {
      id: 7,
      image: placeholder_7,
      title: "Autumn forest walk",
      location: "Kyoto, Japan",
      author: "hana_tanaka",
      authorAvatar: placeholder_7
    },
    {
      id: 8,
      image: placeholder_8,
      title: "Historic streets",
      location: "Prague, Czechia",
      author: "peter_novak",
      authorAvatar: placeholder_8
    },
    {
      id: 9,
      image: placeholder_9,
      title: "Desert adventures",
      location: "Sahara, Morocco",
      author: "fatima_hassan",
      authorAvatar: placeholder_9
    },
    {
      id: 10,
      image: placeholder_10,
      title: "Cozy cafe corner",
      location: "Lisbon, Portugal",
      author: "carlos_silva",
      authorAvatar: placeholder_10
    },
    {
      id: 11,
      image: placeholder_7,
      title: "Morning coffee ritual",
      location: "Vienna, Austria",
      author: "anna_muller",
      authorAvatar: placeholder_1
    },
    {
      id: 12,
      image: placeholder_2,
      title: "Hidden waterfalls",
      location: "Iceland",
      author: "olafsson",
      authorAvatar: placeholder_2
    }
  ];

  const collections = [
    {
      id: 1,
      image: placeholder_9,
      title: "Подборочка номер тридцать два три часа дня и тд и тп",
      pinsCount: 23,
      location: "Paris, Le Mergewf"
    },
    {
      id: 2,
      image: placeholder_7,
      title: "Осенние прогулки",
      pinsCount: 14,
      location: "Kyoto, Japan"
    },
    {
      id: 3,
      image: placeholder_3,
      title: "Вечерние огни мегаполиса",
      pinsCount: 31,
      location: "New York City"
    },
    {
      id: 4,
      image: placeholder_8,
      title: "Исторические улочки",
      pinsCount: 18,
      location: "Prague, Czechia"
    }
  ];

  // === 🌟 ФОРМИРОВАНИЕ ЛЕНТЫ "ПОНРАВИВШИЕСЯ" (likesFeed) ===
// Параметры (можно менять!):
const PINS_PER_ROW = 2;          // сколько пинов в одной строке
const COLLECTIONS_PER_ROW = 1;   // сколько подборок подряд (обычно 1)
const START_WITH = 'collection'; // 'collection' или 'pin-row'

// Копируем массивы, чтобы не мутировать оригиналы
const collectionsCopy = [...collections];
const pinsCopy = [...pins];

const likesFeed: { type: 'collection' | 'pin-row'; data: any }[] = [];

let nextItemType = START_WITH;

while (collectionsCopy.length > 0 || pinsCopy.length > 0) {
  if (nextItemType === 'collection' && collectionsCopy.length > 0) {
    // Берём N подборок подряд (обычно 1)
    const batch = collectionsCopy.splice(0, COLLECTIONS_PER_ROW);
    batch.forEach(collection => {
      likesFeed.push({ type: 'collection', data: collection });
    });
    nextItemType = 'pin-row'; // после подборки — пины

  } else if (nextItemType === 'pin-row' && pinsCopy.length > 0) {
    // Берём K пинов для одной строки
    const batch = pinsCopy.splice(0, PINS_PER_ROW);
    likesFeed.push({ type: 'pin-row', data: batch });
    nextItemType = 'collection'; // после пинов — подборка

  } else {
    // Если одного типа больше нет — переключаемся на оставшийся
    nextItemType = collectionsCopy.length > 0 ? 'collection' : 'pin-row';
  }
}

// 💡 Пример результата (при 4 подборках и 11 пинах, PINS_PER_ROW=2):
// [
//   {type:'collection', data: coll1},
//   {type:'pin-row', data: [pin1, pin2]},
//   {type:'collection', data: coll2},
//   {type:'pin-row', data: [pin3, pin4]},
//   {type:'collection', data: coll3},
//   {type:'pin-row', data: [pin5, pin6]},
//   {type:'collection', data: coll4},
//   {type:'pin-row', data: [pin7, pin8]},
//   {type:'pin-row', data: [pin9, pin10]},
//   {type:'pin-row', data: [pin11]}   ← остаток
// ]2

    const handleCreateCollection = () => {
      // Пока заглушка - всегда авторизован
      navigate('/collection/create');
      
      // Позже добавишь проверку:
      // if (isAuthenticated) {
      //   navigate('/collection/create');
      // } else {
      //   showAuthModal();
      // }
    };
   const handleCreatePin = () => {
      // Пока заглушка - всегда авторизован
      navigate('/pin/create');
      
      // Позже добавишь проверку:
      // if (isAuthenticated) {
      //   navigate('/collection/create');
      // } else {
      //   showAuthModal();
      // }
    };


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
              
              <button onClick={handleCreateCollection} className={styles.newBoardBtn}>Создать подборку</button>
              
              <div className={styles.collectionsGrid}>
                {collections.map(col => (
                  <div key={col.id} className={styles.collectionCard}>
                    <div style={{ display: "flex" }}>

                    <img src={col.image} alt={col.title} className={styles.img1}/>

                    <div className={styles.collectionLabelWrapper}>
                      <div className={styles.collectionTitle}>{col.title}</div>
                      <div className={styles.collectionLocation}>{col.location}</div>
                      <div className={styles.collectionPinsCount}>
                        {col.pinsCount} pins →
                      </div>
                    </div>
                    </div>
                    
                    <div className={styles.pinAuthorWrapperBoard}>
                      <img
                        src={placeholder_1} // аватарка автора
                        alt="Author Avatar"
                        className={styles.pinAuthorAvatar}
                      />
                      <div className={styles.pinAuthor}>
                        {"jane_anderson"}
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            </div>
          )}


          {activeTab === 'pins' && (
            <div>
              <button onClick={handleCreatePin} className={styles.newPinBtn}>Создать пин</button>

              <div className={styles.pinsGrid}>
                {pins.map(pin => (
                  <div key={pin.id} className={styles.pin}>
                    <div className={styles.pinImageWrapper}>
                      <img src={pin.image} alt={pin.title} className={styles.pinImage} />

                      {/* Верхний правый угол — локация */}
                      <div className={styles.pinLocation}>
                        {pin.location || "Paris"}
                      </div>

                      {/* Нижний центр — название */}
                      <div className={styles.pinTitle}>
                        {pin.title}
                      </div>
                    </div>

                    {/* Имя автора под картинкой */}
                    <div className={styles.pinAuthorWrapper}>
                      <img
                        src={pin.authorAvatar || placeholder_1} // аватарка автора
                        alt="Author Avatar"
                        className={styles.pinAuthorAvatar}
                      />
                      <div className={styles.pinAuthor}>
                        {pin.author || "jane_nderson"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {activeTab === 'likes' && (
    <div className={styles.likesFeed}>
      {/* ——— ФОРМИРОВАНИЕ ЛЕНТЫ (встроено прямо здесь — никаких внешних переменных) ——— */}
      {(() => {
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

        return feed.map((block, idx) => (
          <div key={idx} className={styles.feedBlock}>
            {block.type === 'collections' && (
              <div className={styles.collectionsRow}>
                {block.items.map((col: any) => (
                  <div key={col.id} className={styles.collectionCard}>
                    
                    <div style={{ display: "flex" }}>
                      <img src={col.image} alt={col.title} className={styles.img1} />
                      <div className={styles.collectionLabelWrapper}>
                        <div className={styles.collectionTitle}>{col.title}</div>
                        <div className={styles.collectionLocation}>{col.location}</div>
                        <div className={styles.collectionPinsCount}>
                          {col.pinsCount} pins →
                        </div>
                        
                      </div>
                    </div>
                    <div className={styles.pinAuthorWrapperBoard}>
                      <img
                        src={placeholder_1}
                        alt="Author Avatar"
                        className={styles.pinAuthorAvatar}
                      />
                      <div className={styles.pinAuthor}>jane_anderson</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {block.type === 'pins' && (
              <div className={styles.pinsGrid}>
                {block.items.map((pin: any) => (
                  <div key={pin.id} className={styles.pin}>
                    <div className={styles.pinImageWrapper}>
                      <img src={pin.image} alt={pin.title} className={styles.pinImage} />
                      <div className={styles.pinLocation}>
                        {pin.location}
                      </div>
                      <div className={styles.pinTitle}>
                        {pin.title}
                      </div>
                    </div>
                    <div className={styles.pinAuthorWrapper}>
                      <img
                        src={pin.authorAvatar}
                        alt="Author Avatar"
                        className={styles.pinAuthorAvatar}
                      />
                      <div className={styles.pinAuthor}>
                        {pin.author}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ));
      })()}
    </div>
  )}


          {activeTab === 'bookmarks' && <h3>🔖 Ваши закладки</h3>}
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
            // Тут можешь отправить на сервер
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
