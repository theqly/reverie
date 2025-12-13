import { useState } from 'react';
import styles from './Feed.module.css';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import placeholder_1 from '../assets/placeholder1.jpg';
import placeholder_2 from '../assets/placeholder2.jpg';
import placeholder_3 from '../assets/placeholder3.jpg';
import placeholder_4 from '../assets/placeholder4.jpg';
import placeholder_6 from '../assets/placeholder6.jpg';
import placeholder_7 from '../assets/placeholder7.jpg';
import placeholder_8 from '../assets/placeholder8.jpg';
import placeholder_9 from '../assets/placeholder9.jpg';
import placeholder_10 from '../assets/placeholder10.jpg';
import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';


const Feed = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pins'); // 'pins' или 'collections'
  const [onlySubscriptions, setOnlySubscriptions] = useState(false);

  // Обработчик клика по кнопке +
  const handlePlusClick = () => {
    if (activeTab === 'pins') {
      navigate('/pin/create');
    } else if (activeTab === 'collections') {
      navigate('/collection/create');
    }
  };

  // Получаем текст для title кнопки
  const getPlusButtonTitle = () => {
    return activeTab === 'pins' 
      ? 'Создать новый пин' 
      : 'Создать новую подборку';
  };

  // Массив пинов (как в профиле)
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
    },
    {
      id: 13,
      image: placeholder_3,
      title: "Mountain sunrise",
      location: "Swiss Alps",
      author: "alpine_explorer",
      authorAvatar: placeholder_3
    },
    {
      id: 14,
      image: placeholder_4,
      title: "Urban art district",
      location: "Berlin, Germany",
      author: "street_art_lover",
      authorAvatar: placeholder_4
    },
    {
      id: 15,
      image: placeholder_9,
      title: "Seaside cliffs",
      location: "Amalfi Coast, Italy",
      author: "travel_photographer",
      authorAvatar: placeholder_1
    }
  ];

  // Массив подборок (как в профиле)
  const collections = [
    {
      id: 1,
      image: placeholder_9,
      title: "Подборочка номер тридцать два три часа дня и тд и тп",
      pinsCount: 23,
      location: "Paris, Le Mergewf",
      author: "jane_anderson",
      authorAvatar: placeholder_1
    },
    {
      id: 2,
      image: placeholder_7,
      title: "Осенние прогулки",
      pinsCount: 14,
      location: "Kyoto, Japan",
      author: "hana_tanaka",
      authorAvatar: placeholder_7
    },
    {
      id: 3,
      image: placeholder_3,
      title: "Вечерние огни мегаполиса",
      pinsCount: 31,
      location: "New York City",
      author: "michael_lee",
      authorAvatar: placeholder_3
    },
    {
      id: 4,
      image: placeholder_8,
      title: "Исторические улочки",
      pinsCount: 18,
      location: "Prague, Czechia",
      author: "peter_novak",
      authorAvatar: placeholder_8
    },
    {
      id: 5,
      image: placeholder_10,
      title: "Кофейные места Европы",
      pinsCount: 27,
      location: "Various, Europe",
      author: "coffee_lover",
      authorAvatar: placeholder_10
    },
    {
      id: 6,
      image: placeholder_2,
      title: "Горные походы",
      pinsCount: 19,
      location: "Worldwide",
      author: "hiking_enthusiast",
      authorAvatar: placeholder_2
    }
  ];

  // Фильтрация по подпискам (если включено)
  const filteredPins = onlySubscriptions 
    ? pins.filter(pin => ['jane_anderson', 'alex_smith'].includes(pin.author))
    : pins;
  
  const filteredCollections = onlySubscriptions
    ? collections.filter(col => ['jane_anderson', 'hana_tanaka'].includes(col.author))
    : collections;

  const handlePinClick = (pinId) => {
    navigate(`/pin/${pinId}`);
  };

  const handleCollectionClick = (collectionId) => {
    navigate(`/collection/${collectionId}`);
  };

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
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>

            <div className={styles.tabSwitcher}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'pins' ? styles.active : ''}`}
                onClick={() => setActiveTab('pins')}
              >
                Пины
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'collections' ? styles.active : ''}`}
                onClick={() => setActiveTab('collections')}
              >
                Подборки
              </button>
              <div className={styles.tabIndicator} data-active={activeTab} />
            </div>

          </div>

            
            
            {/* Чекбокс "только подписки" */}
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  checked={onlySubscriptions}
                  onChange={(e) => setOnlySubscriptions(e.target.checked)}
                  className={styles.hiddenCheckbox}
                />
                <span className={styles.customCheckbox}>
                  {onlySubscriptions && (
                    <svg className={styles.checkIcon} viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </span>
                <span className={styles.checkboxText}>Только подписки</span>
              </label>
            </div>
          </section>
          
          {activeTab === 'pins' && (
            <div className={styles.pinsGridContainer}>
              <div>
                <PinGrid 
                  pins={pins} 
                  onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
                />
              </div>
            </div>
          )}
          
          {/* Контент вкладки "Подборки" */}
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