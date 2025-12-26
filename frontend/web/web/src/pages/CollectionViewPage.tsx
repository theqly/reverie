import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import MapShower from "./MapShowBoard";
import styles from "./PinViewPage.module.css";
import placeholder_1 from "../assets/placeholder1.jpg";
import placeholder from "../assets/placeholder1.jpg";
import CommentSection from "./CommentSection";
import ReactionBlock from "./ReactionBlock";
import PinGrid from "./PinGrid";

// моки
import { getCollectionById, getCollectionPins } from "../utils/mockData";

// backend
import { getPinById as getBoardById } from "../services/collectionsService";

// реакции
import { countReactionsToBoard, reactToBoard } from "../services/reactionsService";
import { isBoardLiked, isBoardBookmarked } from "../services/collectionsService";
import { toggleBookmarkToBoard } from "../services/bookmarksService";

const FALLBACK_LIKES = 0;
const LIKE_REACTION_ID = "8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f";
const TEMP_USER_ID = "TEMP_USER_ID";

// Генерация случайных координат в пределах Москвы и области
const generateRandomMoscowCoords = (): [number, number] => {
  const moscowLat = 55.7558;
  const moscowLng = 37.6173;
  const radius = 0.3; // Радиус в градусах
  
  // Генерация случайного смещения
  const randomOffsetLat = (Math.random() - 0.5) * 2 * radius;
  const randomOffsetLng = (Math.random() - 0.5) * 2 * radius;
  
  return [
    moscowLat + randomOffsetLat,
    moscowLng + randomOffsetLng
  ];
};

// Функция для генерации пинов с рандомными координатами
const generatePinsWithRandomCoords = (pins: any[]) => {
  return pins.map(pin => ({
    ...pin,
    coordinates: pin.coordinates || generateRandomMoscowCoords(),
    // Добавляем дополнительную информацию для отображения на карте
    mapInfo: {
      title: pin.title || pin.description?.substring(0, 30) || "Место",
      description: pin.description || "Описание отсутствует"
    }
  }));
};

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();

  const [collection, setCollection] = useState<any>(null);
  const [collectionPins, setCollectionPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState<number>(FALLBACK_LIKES);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Для карты - вычисляем средние координаты всех пинов
  const mapCenterCoords = useMemo(() => {
    if (collectionPins.length === 0) {
      return [55.7558, 37.6173]; // Москва по умолчанию
    }
    
    // Вычисляем средние координаты всех пинов
    const sumLat = collectionPins.reduce((sum, pin) => sum + (pin.coordinates?.[0] || 55.7558), 0);
    const sumLng = collectionPins.reduce((sum, pin) => sum + (pin.coordinates?.[1] || 37.6173), 0);
    
    return [
      sumLat / collectionPins.length,
      sumLng / collectionPins.length
    ];
  }, [collectionPins]);

  // Получаем все координаты пинов для отображения на карте
  const pinsForMap = useMemo(() => {
    return collectionPins
      .filter(pin => pin.coordinates && Array.isArray(pin.coordinates))
      .map(pin => ({
        id: pin.id,
        coordinates: pin.coordinates as [number, number],
        title: pin.mapInfo?.title || pin.title || "Место",
        description: pin.mapInfo?.description || pin.description || ""
      }));
  }, [collectionPins]);

  /* ------------------ загрузка коллекции ------------------ */
  useEffect(() => {
    const loadCollection = async () => {
      if (!collectionId) {
        setError("ID коллекции не указан");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Пытаемся получить с бэка
        const board = await getBoardById(collectionId);

        if (board) {
          setCollection(board);
          
          // Преобразуем пины для корректного отображения
          let pins = Array.isArray(board.pins) 
            ? board.pins.map(pin => ({
                ...pin,
                id: pin.id || pin.pinId,
                image: getPinImageUrl(pin),
                author: pin.author || "jane_anderson",
                authorAvatar: placeholder_1,
                description: pin.description || "",
                likes: pin.likes || 0,
                coordinates: pin.coordinates || null
              }))
            : [];
          
          // Добавляем случайные координаты для пинов, у которых их нет
          pins = generatePinsWithRandomCoords(pins);
          
          setCollectionPins(pins);
          setLikesCount(board.rating ?? board.likes ?? FALLBACK_LIKES);
          return;
        }

        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          
          const mockPins = getCollectionPins(collectionId) || [];
          const formattedPins = mockPins.map(pin => ({
            ...pin,
            image: getPinImageUrl(pin),
            author: pin.author || "jane_anderson",
            authorAvatar: placeholder_1,
            description: pin.description || "",
            likes: pin.likes || 0,
            coordinates: pin.coordinates || null
          }));
          
          // Добавляем случайные координаты для пинов, у которых их нет
          const pinsWithCoords = generatePinsWithRandomCoords(formattedPins);
          
          setCollectionPins(pinsWithCoords);
          setLikesCount(mockCollection.likes ?? FALLBACK_LIKES);
        } else {
          setError(`Коллекция с ID ${collectionId} не найдена`);
        }
      } catch (e) {
        console.error("Ошибка загрузки коллекции:", e);
        
        // 3. Фолбэк на моки при ошибке
        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          
          const mockPins = getCollectionPins(collectionId) || [];
          const formattedPins = mockPins.map(pin => ({
            ...pin,
            image: getPinImageUrl(pin),
            author: pin.author || "jane_anderson",
            authorAvatar: placeholder_1,
            description: pin.description || "",
            likes: pin.likes || 0,
            coordinates: pin.coordinates || null
          }));
          
          // Добавляем случайные координаты для пинов, у которых их нет
          const pinsWithCoords = generatePinsWithRandomCoords(formattedPins);
          
          setCollectionPins(pinsWithCoords);
          setLikesCount(mockCollection.likes ?? FALLBACK_LIKES);
        } else {
          setError("Не удалось загрузить коллекцию");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  /* ------------------ загрузка реакций ------------------ */
  useEffect(() => {
    if (!collectionId) return;

    const loadReactions = async () => {
      try {
        const likedStatus = await isBoardLiked(collectionId);
        setLiked(likedStatus);
      } catch {}

      try {
        const bookmarkedStatus = await isBoardBookmarked(collectionId);
        setBookmarked(bookmarkedStatus);
      } catch {}

      try {
        const count = await countReactionsToBoard({ boardId: collectionId });
        let actualCount: number | null = null;

        if (typeof count === "number") actualCount = count;
        else if (typeof count === "string") actualCount = Number(count);
        else if (count && typeof count === "object" && "count" in count) {
          const nested = (count as any).count;
          if (typeof nested === "number") actualCount = nested;
          else if (typeof nested === "string") actualCount = Number(nested);
        }

        if (actualCount !== null && actualCount >= 0) setLikesCount(actualCount);
      } catch (err) {
        console.warn("Не удалось загрузить количество лайков:", err);
      }
    };

    loadReactions();
  }, [collectionId]);

  // Генерация тестовых пинов (можно использовать для демо)
  const generateDemoPins = () => {
    const demoPinsCount = 5; // Количество демо-пинов
    const demoPins = [];
    
    for (let i = 0; i < demoPinsCount; i++) {
      demoPins.push({
        id: `demo-pin-${i}`,
        title: `Демо-место ${i + 1}`,
        description: `Пример описания для демо-места ${i + 1}`,
        image: placeholder_1,
        author: "demo_user",
        authorAvatar: placeholder_1,
        likes: Math.floor(Math.random() * 100),
        coordinates: generateRandomMoscowCoords(),
        mapInfo: {
          title: `Демо-место ${i + 1}`,
          description: `Это демо-описание для теста карты`
        }
      });
    }
    
    return demoPins;
  };

  const handleLike = async (nextLiked: boolean) => {
    setLiked(nextLiked);
    setLikesCount(prev => (nextLiked ? prev + 1 : Math.max(prev - 0, 0)));
    try {
      await reactToBoard({
        boardId: collectionId!,
        reactionId: LIKE_REACTION_ID,
        userId: TEMP_USER_ID,
      });
    } catch (error) {
      console.error("Failed to toggle board reaction", error);
    }
  };

  const handleBookmark = async (nextBookmarked: boolean) => {
    setBookmarked(nextBookmarked);
    try {
      await toggleBookmarkToBoard(collectionId!, TEMP_USER_ID);
    } catch (error) {
      console.error("Failed to toggle board bookmark", error);
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

  // Вспомогательная функция для получения URL изображения пина
  const getPinImageUrl = (pin: any) => {
    if (pin.images && pin.images[0] && pin.images[0].imageUrl) {
      return pin.images[0].imageUrl;
    }
    if (pin.imageUrl) {
      return pin.imageUrl;
    }
    if (pin.image) {
      return pin.image;
    }
    return placeholder_1;
  };

  // Вспомогательная функция для получения URL изображения коллекции
  const getCollectionImageUrl = (): string => {
    if (collection?.image || collection?.boardImageURL || collection?.coverImage) {
      return collection.image || collection.boardImageURL || collection.coverImage;
    }
    if (collection?.images && collection.images[0] && collection.images[0].imageUrl) {
      return collection.images[0].imageUrl;
    }
    if (collection?.coverImageUrl) {
      return collection.coverImageUrl;
    }
    return placeholder; // fallback placeholder
  };

  // Получаем название коллекции
  const getCollectionName = () => {
    return collection?.name || collection?.title || "Без названия";
  };

  // Получаем описание коллекции
  const getCollectionDescription = () => {
    return collection?.description || "";
  };

  // Получаем автора коллекции
  const getCollectionAuthor = () => {
    return collection?.author || collection?.authorName || "jane_anderson";
  };

  // Обработчик для демо-режима (если нужно добавить тестовые пины)
  const handleAddDemoPins = () => {
    const demoPins = generateDemoPins();
    setCollectionPins(prev => [...prev, ...demoPins]);
  };

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
          <button onClick={() => navigate("/feed")} className={styles.backButton}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const comments = [
    {
      authorName: getCollectionAuthor(),
      authorAvatar: placeholder_1,
      commentText: "Отличная подборка! Спасибо за рекомендации.",
      commentDate: "2 часа назад",
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

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn} />
            <h2>
              Подборка от <Link to="/profile" className={styles.authorA}>@{getCollectionAuthor()}</Link>
            </h2>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/collection/edit/${collectionId}`)}
            />
          
          </div>

          <div className={styles.pinCard}>
            <img
              src={getCollectionImageUrl()}
              alt={getCollectionName()}
              className={styles.img1}
            />
            <h3 className={styles.pinTitle}>{getCollectionName()}</h3>
            <p className={styles.pinDescription}>
              {getCollectionDescription() || "Без описания"}
            </p>

            <ReactionBlock
              initialLikes={likesCount}
              initialLiked={liked}
              initialBookmarked={bookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          </div>

          <h3 className={styles.pinsTitle}>
            Места в подборке ({collectionPins.length})
          </h3>

          <div className={styles.pinsWrapper}>
            <PinGrid
              pins={collectionPins}
              onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
            />
          </div>

          <CommentSection comments={comments} title="Комментарии" />
        </div>

        {/* Правая колонка для карты */}
        <div className={styles.mapWrapperFixed}>
          {pinsForMap.length === 0 ? (
            <div className={styles.emptyMapPlaceholder}>
              <div className={styles.placeholderContent}>
                <p className={styles.placeholderText}>
                  Когда тут будут пины, мы покажем их на карте
                </p>
                <button 
                  className={styles.addPinButton}
                  onClick={() => navigate(`/pin/create?collectionId=${collectionId}`)}
                >
                  Добавить первый пин
                </button>
                {/* Кнопка для быстрого добавления демо-пинов */}
                <button 
                  className={styles.demoButton}
                  onClick={handleAddDemoPins}
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Посмотреть демо-карту
                </button>
              </div>
            </div>
          ) : (
            <MapShower
              readOnly
              onSelect={() => {}}
              initialCoords={mapCenterCoords as [number, number]}
              // Передаем массив пинов для отображения нескольких меток
              pins={pinsForMap}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionViewPage;