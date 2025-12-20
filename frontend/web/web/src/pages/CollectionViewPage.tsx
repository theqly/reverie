import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Header from "./Header";
import styles from "./PinViewPage.module.css"; // Можно оставить, если стили общие
import placeholder_1 from '../assets/placeholder1.jpg';
import CommentSection from './CommentSection';
import ReactionBlock from './ReactionBlock';
import PinGrid from './PinGrid';
import { Link } from 'react-router-dom';

// Моки (фолбэк)
import { getCollectionById, getCollectionPins } from '../utils/mockData';

// Сервис (обрати внимание: странное имя — лучше переименовать в getBoardById)
import { getPinById as getBoardById } from '../services/collectionsService';

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const [collection, setCollection] = useState(null);
  const [collectionPins, setCollectionPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCollection = async () => {
      if (!collectionId) {
        setError('ID коллекции не указан');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Пытаемся загрузить с бэкенда
        const board = await getBoardById(collectionId);

        if (board) {
          setCollection(board);
          setCollectionPins(Array.isArray(board.pins) ? board.pins : []);
          return;
        }

        // 2. Фолбэк на моки
        console.log("Используем моки для коллекции");
        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          setCollectionPins(getCollectionPins(collectionId) || []);
        } else {
          setError(`Коллекция с ID ${collectionId} не найдена`);
        }
      } catch (e) {
        console.error("Ошибка загрузки коллекции:", e);

        // 3. Фолбэк на моки при ошибке
        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          setCollectionPins(getCollectionPins(collectionId) || []);
        } else {
          setError('Не удалось загрузить коллекцию');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  const handleBack = () => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    if (from) {
      navigate(`/${from}`);
    } else if (document.referrer && document.referrer.includes(window.location.origin)) {
      const referrerPath = new URL(document.referrer).pathname;
      navigate(referrerPath);
    } else {
      navigate(-1);
    }
  };

  // Комментарии (моковые)
  const comments = [
    {
      authorName: "jane_anderson",
      authorAvatar: placeholder_1,
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

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Коллекция не найдена</h2>
          <p>{error || "Не удалось загрузить данные"}</p>
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
        {/* Левая колонка — контент */}
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h2>
              Подборка: <strong>{collection.name}</strong>
            </h2>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/collection/edit/${collectionId}`)}
            ></button>
          </div>

          {/* Карточка коллекции */}
          <div className={styles.pinCard}>
            <h3 className={styles.pinTitle}>{collection.name}</h3>
            <p className={styles.pinDescription}>
              {collection.description || "Без описания"}
            </p>

            {/* ❌ Убрано: нет coords, image, author, location у доски */}

            <ReactionBlock
              initialLikes={226}
              initialLiked={false}
              initialBookmarked={collection.bookmarked || false}
              onLike={(isLiked) => console.log('Лайк:', isLiked)}
              onBookmark={(isBookmarked) => console.log('Закладка:', isBookmarked)}
            />
          </div>

          {/* Пины коллекции */}
          <h3 className={styles.pinsTitle}>
            Места в подборке ({collectionPins.length})
          </h3>

          <div className={styles.pinsWrapper}>
            <PinGrid
              pins={collectionPins}
              onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
            />
          </div>

          {/* Комментарии */}
          <CommentSection comments={comments} title="Комментарии" />
        </div>

        {/* Правая колонка — карта */}
        {/* ⚠️ Доска не имеет координат. 
             Если хочешь показать карту — нужно собирать координаты из пинов.
             Пока временно скрыто. */}
        {/* 
        <div className={styles.mapWrapperFixed}>
          <MapPicker onSelect={() => {}} readOnly />
        </div>
        */}
      </div>
    </div>
  );
};

export default CollectionViewPage;