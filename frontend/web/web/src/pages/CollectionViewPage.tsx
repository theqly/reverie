import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Header from "./Header";
import MapPicker from "./MapPicker";
import styles from "./PinViewPage.module.css";
import placeholder_1 from '../assets/placeholder1.jpg';
import CommentSection from './CommentSection';
import ReactionBlock from './ReactionBlock';
import PinGrid from './PinGrid';
import { Link } from 'react-router-dom';

import { 
  getCollectionById, 
  getCollectionPins 
} from '../utils/mockData';

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams(); // Получаем ID коллекции из URL
  const [collection, setCollection] = useState(null);
  const [collectionPins, setCollectionPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем данные коллекции при монтировании или изменении collectionId
  useEffect(() => {
    if (collectionId) {
      const foundCollection = getCollectionById(collectionId);
      
      if (foundCollection) {
        setCollection(foundCollection);
        // Получаем пины этой коллекции
        const pins = getCollectionPins(collectionId);
        setCollectionPins(pins);
        setError(null);
      } else {
        setError(`Подборка с ID ${collectionId} не найдена`);
      }
      
      setLoading(false);
    }
  }, [collectionId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/feed');
    }
  };

  // Комментарии
  const comments = [
    {
      authorName: collection?.author || "jane_anderson",
      authorAvatar: collection?.authorAvatar || placeholder_1,
      commentText: "Отличная подборка! Спасибо за рекомендации.",
      commentDate: "2 часа назад"
    },
    {
      authorName: "alex_smith",
      authorAvatar: placeholder_1,
      commentText: "Уже посетил несколько мест из этой коллекции, все понравилось!",
      commentDate: "5 часов назад"
    },
    {
      authorName: "travel_lover",
      authorAvatar: placeholder_1,
      commentText: "Обязательно сохраню себе, чтобы посетить в будущем.",
      commentDate: "1 день назад"
    }
  ];

  // Показываем загрузку
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  // Показываем ошибку
  if (error || !collection) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Подборка не найдена</h2>
          <p>{error || "Не удалось загрузить данные подборки"}</p>
          <button onClick={() => navigate('/feed')} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.contentWrapper}>
        {/* Левая колонка — скроллимый контент */}
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h2>Подборка от <Link to={`/profile`} className={styles.authorA}>@{collection.author}</Link></h2>
            <button className={styles.settingsBtn} onClick={() => navigate('/collection/edit')}></button>

          </div>

          <div className={styles.pinCard}>
            
            <img src={collection.image} alt={collection.title} className={styles.img1} />
            <h3 className={styles.pinTitle}>{collection.title}</h3>
            <p className={styles.collectionLocation}>{collection.location}</p>
            <p className={styles.pinDescription}>{collection.description}</p>

            <p className={styles.pinCoords}>
              Координаты: {collection.coords[0]}, {collection.coords[1]}
            </p>
          
            
            <ReactionBlock 
              initialLikes={226}
              initialLiked={false}
              initialBookmarked={false}
              onLike={(isLiked) => console.log('Лайк:', isLiked)}
              onBookmark={(isBookmarked) => console.log('Закладка:', isBookmarked)}
            />
          </div>

          <h3 className={styles.pinsTitle}>
            Места из этой подборки ({collectionPins.length})
          </h3>

          <div className={styles.pinsWrapper}>
            <PinGrid 
              pins={collectionPins} 
              onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
            />
          </div>

          <CommentSection 
            comments={comments}
            title="Комментарии"
          />
        </div>

        {/* Правая фиксированная карта */}
        <div className={styles.mapWrapperFixed}>
          <MapPicker 
            onSelect={() => {}} 
            initialCoords={collection.coords} 
            readOnly 
          />
        </div>
      </div>
    </div>
  );
};

export default CollectionViewPage;