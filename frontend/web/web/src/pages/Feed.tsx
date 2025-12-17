import { useState } from 'react';
import styles from './Feed.module.css';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PinGrid from './PinGrid';
import CollectionGrid from './CollectionGrid';
import { mockPins, mockCollections } from '../utils/mockData';

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

  // Используем данные из mockData
  const pins = mockPins;
  const collections = mockCollections;

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
        
        {/* Контент вкладки "Пины" */}
        {activeTab === 'pins' && (
          <div className={styles.pinsGridContainer}>
            <PinGrid 
              pins={filteredPins} 
              onPinClick={handlePinClick}
            />
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