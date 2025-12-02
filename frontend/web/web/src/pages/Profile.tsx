import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import Header from './Header';

const Profile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'collections' | 'pins' | 'likes' | 'bookmarks'>('collections');

  const handleBack = () => {
    navigate('/');
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

          <div className={styles.bio}>
            The photographer capturing moments around the world based in Paris
          </div>

          <button className={styles.editBtn}>Редактировать профиль</button>

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
          {activeTab === 'collections' && <h3>📁 Здесь будут ваши подборки</h3>}
          {activeTab === 'pins' && <h3>📌 Здесь будут ваши пины</h3>}
          {activeTab === 'likes' && <h3>❤️ Ваши понравившиеся</h3>}
          {activeTab === 'bookmarks' && <h3>🔖 Ваши закладки</h3>}
        </div>

      </main>
    </div>
  );
};

export default Profile;
