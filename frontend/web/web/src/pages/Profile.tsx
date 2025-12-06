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




const Profile = () => {
  const navigate = useNavigate();
  

  const [activeTab, setActiveTab] = useState<'collections' | 'pins' | 'likes' | 'bookmarks'>('collections');

  const handleBack = () => {
    navigate('/');
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
  const mixedItems = [
  ...collections.map(col => ({ type: "collection", data: col })),
  ...pins.map(pin => ({ type: "pin", data: pin }))
];



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
              <div className={styles.avatar}></div>

              <div className={styles.info}>
                <div className={styles.name}>Jane Anderson</div>
                <ul className={styles.follow_options}>
                  <li>
                    <a><p>1247 </p>подписчиков</a>
                  </li>
                  <li>
                    <a><p>450 </p>подписок</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.btn_container} style={{ display: "flex" }}>
              <button className={styles.reportBtn}>Редактировать профиль </button>
              <button className={styles.reportBtn}>Настройки </button>
              <button className={styles.reportBtn}>Поделиться </button>
            </div>



          </div>

          <div className={styles.bio}>
            The photographer capturing moments around the world based in Paris
          </div>


        <div style={{ display: "flex" }}>
          <button className={styles.editBtn}>Подписаться </button>
          <button className={styles.reportBtn}>Report </button>
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
            <div className={styles.collectionsGrid}>
              {collections.map(col => (
                <div key={col.id} className={styles.collectionCard}>
                  <div style={{ display: "flex" }}>

                  <img src={col.image} alt={col.title} className={styles.img1}/>

                  <div className={styles.collectionLabelWrapper}>
                    <div className={styles.collectionTitle}>{col.title}</div>
                    <div className={styles.collectionPinsCount}>
                      {col.pinsCount} pins →
                    </div>
                    <div className={styles.collectionLocation}>{col.location}</div>
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
          )}


          {activeTab === 'pins' && (
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
          )}



          {activeTab === 'likes' && (
            <div className={styles.likesLayout}>
              
              {/* Левая колонка — подборки */}
              <div className={styles.likesCollections}>
                {collections.map(col => (
                  <div key={col.id} className={styles.collectionCard}>
                    <div style={{ display: "flex" }}>
                      <img src={col.image} alt={col.title} className={styles.img1} />

                      <div className={styles.collectionLabelWrapper}>
                        <div className={styles.collectionTitle}>{col.title}</div>
                        <div className={styles.collectionPinsCount}>{col.pinsCount} pins →</div>
                        <div className={styles.collectionLocation}>{col.location}</div>
                      </div>
                    </div>

                    {/* Автор под подборкой */}
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

              {/* Правая часть — 2 колонки пинов */}
              <div className={styles.likesPins}>
                {pins.map(pin => (
                  <div key={pin.id} className={styles.pin}>
                    <div className={styles.pinImageWrapper}>
                      <img src={pin.image} alt={pin.title} className={styles.pinImage} />

                      <div className={styles.pinLocation}>
                        {pin.location}
                      </div>

                      <div className={styles.pinTitle}>{pin.title}</div>
                    </div>

                    <div className={styles.pinAuthorWrapper}>
                      <img
                        src={pin.authorAvatar}
                        alt="Author Avatar"
                        className={styles.pinAuthorAvatar}
                      />
                      <div className={styles.pinAuthor}>{pin.author}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}


          {activeTab === 'bookmarks' && <h3>🔖 Ваши закладки</h3>}
        </div>
      </main>
    </div>
  );
};

export default Profile;
