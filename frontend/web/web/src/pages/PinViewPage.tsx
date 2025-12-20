import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Header from "./Header";
import MapPicker from "./MapPicker";
import styles from "./PinViewPage.module.css";
import placeholder_1 from '../assets/placeholder1.jpg';
import ReactionBlock from './ReactionBlock';
import CommentSection from './CommentSection';
import { Link } from 'react-router-dom';

// Импортируем функции из mockData и сервиса
import { getPinById as getMockPinById } from '../utils/mockData';
import { getPinById as getBackendPinById } from '../services/pinService';

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams();
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем данные пина при монтировании или изменении pinId
  useEffect(() => {
    const loadPin = async () => {
      if (!pinId) return;

      setLoading(true);
      setError(null);

      try {
        // 1. Пытаемся получить с бэка
        const backendPin = await getBackendPinById(pinId);

        if (backendPin) {
          setPin(backendPin);
          return;
        }

        // 2. Фолбек на моки
        console.log("Используем моки для пина");
        const mockPin = getMockPinById(pinId);

        if (mockPin) {
          setPin(mockPin);
        } else {
          setError(`Пин с ID ${pinId} не найден`);
        }

      } catch (e) {
        console.error(e);

        // 3. Фолбек на моки при ошибке
        console.log("Ошибка при загрузке, используем моки");
        const mockPin = getMockPinById(pinId);

        if (mockPin) {
          setPin(mockPin);
        } else {
          setError('Не удалось загрузить пин');
        }

      } finally {
        setLoading(false);
      }
    };

    loadPin();
  }, [pinId]);

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

  // Комментарии (временно моковые, можно будет заменить на данные с бэка)
  const comments = [
    {
      authorName: pin?.author || "jane_anderson",
      authorAvatar: pin?.authorAvatar || placeholder_1,
      commentText: "Отличное фото! Очень красивое место.",
      commentDate: "2 часа назад"
    },
    {
      authorName: "alex_smith",
      authorAvatar: placeholder_1,
      commentText: "Был там прошлым летом, незабываемые впечатления!",
      commentDate: "5 часов назад"
    },
    {
      authorName: "travel_lover",
      authorAvatar: placeholder_1,
      commentText: "Спасибо за рекомендацию, обязательно посещу!",
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
  if (error || !pin) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Пин не найден</h2>
          <p>{error || "Не удалось загрузить данные пина"}</p>
          <button onClick={() => navigate('/feed')} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Основной рендер с данными пина
  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.contentWrapper}>
        {/* Левая колонка — скроллимый контент */}
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn}></button>
            <h2>Пин от <Link to={`/profile`} className={styles.authorA}>@{pin.author}</Link></h2>
            <button className={styles.settingsBtn} onClick={() => navigate(`/pin/edit/${pinId}`)}></button>
          </div>

          <div className={styles.pinCardWrapper}> 
            <div className={styles.pinCard}>
              <img src={pin.image} alt={pin.title} className={styles.img1} />
              <h3 className={styles.pinTitle}>{pin.title}</h3>
              <p className={styles.collectionLocation}>{pin.location}</p>
              <p className={styles.pinDescription}>{pin.description}</p>

              <p className={styles.pinCoords}>
                Координаты: {pin.coords[0]}, {pin.coords[1]}
              </p>
              
              <ReactionBlock 
                initialLikes={pin.likes || 226}
                initialLiked={pin.isLiked || false}
                initialBookmarked={pin.isBookmarked || false}
                onLike={(isLiked) => console.log('Лайк:', isLiked)}
                onBookmark={(isBookmarked) => console.log('Закладка:', isBookmarked)}
              />
            </div>
            
            <CommentSection 
              comments={comments}
              title="Комментарии"
            />
          </div>
        </div>

        {/* Правая фиксированная карта */}
        <div className={styles.mapWrapperFixed}>
          <MapPicker 
            onSelect={() => {}} 
            initialCoords={pin.coords} 
            readOnly 
          />
        </div>
      </div>
    </div>
  );
};

export default PinViewPage;