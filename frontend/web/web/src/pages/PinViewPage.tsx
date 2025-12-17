import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Header from "./Header";
import MapPicker from "./MapPicker";
import styles from "./PinViewPage.module.css";
import placeholder_1 from '../assets/placeholder1.jpg';
import ReactionBlock from './ReactionBlock';
import CommentSection from './CommentSection';
import { getPinById } from '../utils/mockData'; // Импортируем функцию
import { Link } from 'react-router-dom';

import { mockPins } from '../utils/mockData'; // Импортируем массив (опционально)

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams(); // Получаем ID из URL
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем данные пина при монтировании или изменении pinId
  useEffect(() => {
    if (pinId) {
      const foundPin = getPinById(pinId);
      
      if (foundPin) {
        setPin(foundPin);
        setError(null);
      } else {
        setError(`Пин с ID ${pinId} не найден`);
      }
      
      setLoading(false);
    }
  }, [pinId]);

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

  // Моковые комментарии (можно потом вынести в mockData)
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
  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/feed')} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Если пин не найден (защита на случай undefined)
  if (!pin) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Пин не найден</h2>
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
            <button className={styles.settingsBtn} onClick={() => navigate(`/pin/edit/${pinId}}`)}></button>
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
                initialLikes={226}
                initialLiked={false}
                initialBookmarked={false}
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