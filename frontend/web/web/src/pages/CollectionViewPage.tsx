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

import {getPinById} from '../services/collectionsService'

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams(); // Получаем ID коллекции из URL
  const [collection, setCollection] = useState(null);
  const [collectionPins, setCollectionPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем данные коллекции при монтировании или изменении collectionId
  useEffect(() => {
  const loadCollection = async () => {
    if (!collectionId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Пытаемся получить с бэка
      const board = await getPinById(collectionId);

      if (board) {
        setCollection(board);
        setCollectionPins(board.pins ?? []);
        return;
      }

      console.log("moki");

      // 2. Фолбек на моки
      const mockCollection = getCollectionById(collectionId);

      if (mockCollection) {
        setCollection(mockCollection);
        setCollectionPins(getCollectionPins(collectionId));
      } else {
        setError(`Подборка с ID ${collectionId} не найдена`);
      }

    } catch (e) {
      console.error(e);

      // 3. Фолбек на моки при ошибке
      console.log("moki");

      const mockCollection = getCollectionById(collectionId);

      if (mockCollection) {
        setCollection(mockCollection);
        setCollectionPins(getCollectionPins(collectionId));
      } else {
        setError('Не удалось загрузить подборку');
      }

    } finally {
      setLoading(false);
    }
  };

  loadCollection();
}, [collectionId]);


  const handleBack = () => {
    // Пробуем взять from из URL
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    if (from) {
      // Если есть параметр from - используем его
      navigate(`/${from}`);
    } else if (document.referrer && document.referrer.includes(window.location.origin)) {
      // Если есть реферер и он с нашего сайта - используем его
      const referrerPath = new URL(document.referrer).pathname;
      navigate(referrerPath);
    } else {
      // Иначе возвращаемся в историю или на фид по умолчанию
      navigate(-1);
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
            <button className={styles.settingsBtn} onClick={() => navigate(`/collection/edit/${collectionId}`)}></button>

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