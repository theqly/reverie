import { useEffect, useState } from 'react';
import styles from './LikedPins.module.css';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

// импорт локальной заглушки
import placeholder from '../assets/placeholder.jpg';

const LikedPins = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate('/collection/create');

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 20 }).map(() => placeholder);
    setImages(arr);
  }, []);

  return (
    <div>
      <Header />

      <main className={styles.collectionContent}>
        <div className={styles.h_container}>
          <button onClick={handleBack} className={styles.back_btn}></button>
          <h2>Выберите пины</h2>
        </div>

        <div className={styles.grid}>
          {images.map((url, i) => (
            <div key={i} className={styles.gridItem}>
              <img className={styles.photo} src={url} alt="placeholder" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LikedPins;
