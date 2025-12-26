import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import MapShower from "./MapShower";
import styles from "./PinViewPage.module.css";
import placeholder_1 from "../assets/placeholder1.jpg";
import ReactionBlock from "./ReactionBlock";
import CommentSection from "./CommentSection";


// mock + backend
import { getPinById as getMockPinById } from "../utils/mockData";
import { getPinById as getBackendPinById } from "../services/pinService";
import { countReactionsToPin, reactToPin } from "../services/reactionsService";
import { toggleBookmarkToPin } from "../services/bookmarksService";
import { isPinLiked, isPinBookmarked } from "../services/pinService";
//  import { addPinToBoard } from "../services/addPinToBoardService";
// Добавляем импорт сервиса для работы с подборками
import { getOwnBoardsByUser } from "../services/profileService";

const FALLBACK_LIKES = 226;
const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

// Интерфейс для подборки
interface Collection {
  id: string;
  name: string;
  description?: string;
  author?: string;
  // другие поля при необходимости
}

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams();

  const [pin, setPin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState<number>(FALLBACK_LIKES);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Состояния для модального окна и подборок
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [errorCollections, setErrorCollections] = useState<string | null>(null);

  useEffect(() => {
    if (!pinId) return;

    const loadPin = async () => {
      setLoading(true);
      setError(null);

      try {
        const backendPin = await getBackendPinById(pinId);

        if (backendPin) {
          setPin(backendPin);
          setLikesCount(backendPin.rating ?? backendPin.likes ?? FALLBACK_LIKES);
          return;
        }

        const mockPin = getMockPinById(pinId);
        if (mockPin) {
          setPin(mockPin);
          setLikesCount(mockPin.likes ?? FALLBACK_LIKES);
        } else {
          setError(`Пин с ID ${pinId} не найден`);
        }
      } catch {
        // 3. Фолбек на моки при ошибке
        console.log("Ошибка при загрузке, используем моки");
        const mockPin = getMockPinById(pinId);
        if (mockPin) {
          setPin(mockPin);
          setLikesCount(mockPin.likes ?? FALLBACK_LIKES);
        } else {
          setError("Не удалось загрузить пин");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPin();
  }, [pinId]);

  useEffect(() => {
    if (!pinId) return;

    const loadReactions = async () => {
      try {
        const likedStatus = await isPinLiked(pinId);
        setLiked(likedStatus);
      } catch {}

      try {
        const bookmarkedStatus = await isPinBookmarked(pinId);
        setBookmarked(bookmarkedStatus);
      } catch {}

      try {
        const reactionsCount = await countReactionsToPin({ pinId });
        if (typeof reactionsCount === "number" && reactionsCount >= 0) {
          setLikesCount(reactionsCount);
        }
      } catch {}
    };

    loadReactions();
  }, [pinId]);

  // Функция загрузки подборок пользователя
  const loadUserCollections = async () => {
    if (!showCollectionsModal) return; // Загружаем только при открытии модалки
    
    setLoadingCollections(true);
    setErrorCollections(null);

    try {
      const response = await getOwnBoardsByUser({
        userId: TEMP_USER_ID,
        limit: 50, // Достаточно много, чтобы показать все
        offset: 0,
      });

      if (response && response.length > 0) {
        // Преобразуем ответ в нужный формат
        const formattedCollections: Collection[] = response.map((col: any) => ({
          id: col.id || col._id,
          name: col.name,
          description: col.description,
          author: col.author,
        }));
        setCollections(formattedCollections);
      } else {
        console.log("Нет подборок или пустой ответ");
        setCollections([]);
      }
    } catch (err) {
      console.error("[PinViewPage] getOwnBoardsByUser error:", err);
      setErrorCollections("Не удалось загрузить подборки");
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Загружаем подборки при открытии модалки
  useEffect(() => {
    if (showCollectionsModal) {
      loadUserCollections();
    }
  }, [showCollectionsModal]);

  const handleLike = async (nextLiked: boolean) => {
    setLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(prev - 1, 0));

    try {
      await reactToPin({ pinId, userId: TEMP_USER_ID });
    } catch (error) {
      console.error("Failed to toggle pin reaction", error);
    }
  };

  const handleBookmark = async (nextBookmarked: boolean) => {
    setBookmarked(nextBookmarked);
    try {
      await toggleBookmarkToPin(pinId!, TEMP_USER_ID);
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  };

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

  // Обработчик клика по кнопке "Добавить пин в подборку"
  const handleAddToCollectionClick = () => {
    setShowCollectionsModal(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setShowCollectionsModal(false);
    setErrorCollections(null);
  };

  // Обработчик выбора подборки
// Импортируем функцию addPinToBoard

// В компоненте, где вызывается handleSelectCollection:
const handleSelectCollection = async (collectionId: string, collectionName: string) => {
  if (!pinId) {
    console.error("Не указан pinId для добавления в подборку");
    return;
  }

  console.log(`Добавляем пин ${pinId} в подборку ${collectionName} (${collectionId})`);
  
  try {
    // Вызываем API для добавления пина в подборку
    //const result = await addPinToBoard(pinId, collectionId);
    
    if (result) {
      console.log("Пин успешно добавлен в подборку");
      
      // Можно показать уведомление пользователю
      // Пример с кастомным уведомлением:
      //alert(`Пин успешно добавлен в подборку "${collectionName}"`);
      
      // Или использовать toast/notification компонент:
      // showNotification('success', `Пин добавлен в "${collectionName}"`);
      
      // Если нужно обновить состояние
      // Например, если есть локальное состояние с подборками пользователя
      // updateCollectionsState(collectionId, pinId);
    } else {
      console.error("Не удалось добавить пин в подборку");
      alert("Не удалось добавить пин в подборку. Попробуйте еще раз.");
    }
  } catch (error) {
    console.error("Ошибка при добавлении пина в подборку:", error);
    alert("Произошла ошибка при добавлении пина в подборку.");
  }
  
  // Закрываем модальное окно
  handleCloseModal();
};

  if (loading) return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.loading}>Загрузка...</div>
    </div>
  );

  if (error || !pin) return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.errorContainer}>
        <h2>Пин не найден</h2>
        <p>{error || "Не удалось загрузить данные пина"}</p>
        <button onClick={() => navigate("/feed")} className={styles.backButton}>
          Вернуться на главную
        </button>
      </div>
    </div>
  );

  // Комментарии
  const comments = [
    {
      authorName: pin?.author || "jane_anderson",
      authorAvatar: placeholder_1,
      commentText: "Отличное фото! Очень красивое место.",
      commentDate: "2 часа назад",
    },
    {
      authorName: "alex_smith",
      authorAvatar: placeholder_1,
      commentText: "Отличное фото! Очень красивое место.",
      commentDate: "2 часа назад",
    },
  ];

  // Извлекаем URL изображения с правильной обработкой
  const getImageUrl = () => {
    // Проверяем разные возможные пути к изображению
    if (pin.images && pin.images[0] && pin.images[0].imageUrl) {
      return pin.images[0].imageUrl;
    }
    if (pin.imageUrl) {
      return pin.imageUrl;
    }
    // Если ничего нет, используем заглушку
    return placeholder_1;
  };

  // Получаем название пина
  const getPinName = () => {
    return pin.name || pin.title || "Без названия";
  };

  // Получаем автора
  const getAuthor = () => {
    return pin.author || "jane_anderson";
  };

  // Получаем описание
  const getDescription = () => {
    return pin.description || "";
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn} />
            <h2>
              Пин от <Link to="/profile" className={styles.authorA}>@{getAuthor()}</Link>
            </h2>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/pin/edit/${pinId}`)}
            />
          </div>

          <div className={styles.pinCardWrapper}>
            <div className={styles.pinCard}>
              <img src={getImageUrl()} alt={getPinName()} className={styles.img1} />
              <h3 className={styles.pinTitle}>{getPinName()}</h3>
              
              {/* Координаты и локация */}
              {pin.latitude != null && pin.longitude != null && (
                <p className={styles.collectionLocation}>
                  Координаты: {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                </p>
              )}
              
              {/* Альтернативное отображение location если есть */}
              {pin.location && !pin.latitude && (
                <p className={styles.collectionLocation}>{pin.location}</p>
              )}
              
              <p className={styles.pinDescription}>{getDescription()}</p>

              <ReactionBlock
                initialLikes={likesCount}
                initialLiked={liked}
                initialBookmarked={bookmarked}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            </div>
            <button 
              className={styles.addTo}
              onClick={handleAddToCollectionClick}
            >
              Добавить пин в подборку
            </button>

            <CommentSection comments={comments} title="Комментарии" />
          </div>
        </div>

        <div className={styles.mapWrapperFixed}>
          {pin.latitude != null && pin.longitude != null && (
            <MapShower
              readOnly
              onSelect={() => {}}
              initialCoords={[pin.latitude, pin.longitude]}
            />
          )}
        </div>
      </div>

      {/* Модальное окно для выбора подборки */}
      {showCollectionsModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Выберите подборку</h3>
              <button 
                className={styles.modalCloseBtn}
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {loadingCollections ? (
                <div className={styles.modalLoading}>Загрузка подборок...</div>
              ) : errorCollections ? (
                <div className={styles.modalError}>
                  <p>{errorCollections}</p>
                  <button 
                    onClick={loadUserCollections}
                    className={styles.retryButton}
                  >
                    Повторить попытку
                  </button>
                </div>
              ) : collections.length === 0 ? (
                <div className={styles.modalEmpty}>
                  <p>У вас пока нет подборок</p>
                  <button 
                    onClick={() => {
                      handleCloseModal();
                      navigate('/collection/create');
                    }}
                    className={styles.createCollectionButton}
                  >
                    Создать новую подборку
                  </button>
                </div>
              ) : (
                <ul className={styles.collectionsList}>
                  {collections.map((collection) => (
                    <li 
                      key={collection.id}
                      className={styles.collectionItem}
                      onClick={() => handleSelectCollection(collection.id, collection.name)}
                    >
                      <div className={styles.collectionInfo}>
                        <span className={styles.collectionName}>{collection.name}</span>
                        {collection.description && (
                          <span className={styles.collectionDescription}>
                            {collection.description}
                          </span>
                        )}
                      </div>
                      <div className={styles.collectionAction}>+</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinViewPage;
