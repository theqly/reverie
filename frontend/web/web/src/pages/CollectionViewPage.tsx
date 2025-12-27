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
import { 
  getPinById as getBoardById,
  getPinById as getPinByIdService // Добавляем сервис для получения пина по ID
} from "../services/collectionsService";


// сервис для получения полной информации о пине
import { getPinById as getFullPinInfo } from "../services/pinService";

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
  
  const randomOffsetLat = (Math.random() - 0.5) * 2 * radius;
  const randomOffsetLng = (Math.random() - 0.5) * 2 * radius;
  
  return [
    moscowLat + randomOffsetLat,
    moscowLng + randomOffsetLng
  ];
};

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();

  const [collection, setCollection] = useState<any>(null);
  const [collectionPins, setCollectionPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPins, setLoadingPins] = useState(false);

  const [likesCount, setLikesCount] = useState<number>(FALLBACK_LIKES);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

    const getPinImageUrl = (pin: any) => {
    if (pin.image) return pin.image;
    if (pin.images && pin.images[0] && pin.images[0].imageUrl) {
      return pin.images[0].imageUrl;
    }
    if (pin.imageUrl) {
      return pin.imageUrl;
    }
    return placeholder_1;
  };
  
  // Для карты
  const mapCenterCoords = useMemo(() => {
    if (collectionPins.length === 0) {
      return [55.7558, 37.6173];
    }
    
    const validPins = collectionPins.filter(pin => 
      pin.latitude && pin.longitude
    );
    
    if (validPins.length === 0) return [55.7558, 37.6173];
    
    const sumLat = validPins.reduce((sum, pin) => sum + pin.latitude, 0);
    const sumLng = validPins.reduce((sum, pin) => sum + pin.longitude, 0);
    
    return [
      sumLat / validPins.length,
      sumLng / validPins.length
    ];
  }, [collectionPins]);

  // Получаем все координаты пинов для отображения на карте
  const pinsForMap = useMemo(() => {
    return collectionPins
      .filter(pin => pin.latitude && pin.longitude)
      .map(pin => ({
        id: pin.id,
        coordinates: [pin.latitude, pin.longitude] as [number, number],
        title: pin.name || pin.title || "Место",
        description: pin.description || "",
        image: getPinImageUrl(pin) // Добавляем изображение для карты
      }));
  }, [collectionPins]);

  /* ------------------ Функция для загрузки деталей пина ------------------ */
  const loadPinDetails = async (pinId: string): Promise<any> => {
    try {
      const fullPin = await getFullPinInfo(pinId);
      
      if (fullPin) {
        return {
          id: pinId,
          name: fullPin.name || fullPin.title || "Без названия",
          description: fullPin.description || "",
          image: getFullPinImageUrl(fullPin),
          author: fullPin.author || fullPin.owner?.nickname || "jane_anderson",
          authorAvatar: placeholder_1,
          likes: fullPin.rating || fullPin.likes || 0,
          latitude: fullPin.latitude,
          longitude: fullPin.longitude,
          createdAt: fullPin.createdAt,
          images: fullPin.images || [],
          rating: fullPin.rating,
          // Сохраняем полный объект пина
          fullData: fullPin
        };
      }
    } catch (error) {
      console.error(`Ошибка загрузки пина ${pinId}:`, error);
    }
    
    // Если не удалось загрузить, возвращаем базовую информацию
    return {
      id: pinId,
      name: "Без названия",
      description: "",
      image: placeholder_1,
      author: "jane_anderson",
      authorAvatar: placeholder_1,
      likes: 0,
      latitude: null,
      longitude: null
    };
  };

  /* ------------------ Загрузка деталей всех пинов ------------------ */
  const loadAllPinDetails = async (pinIds: string[]) => {
    setLoadingPins(true);
    
    try {
      // Загружаем детали для каждого пина параллельно
      const pinPromises = pinIds.map(pinId => loadPinDetails(pinId));
      const pinsWithDetails = await Promise.all(pinPromises);
      
      setCollectionPins(pinsWithDetails);
    } catch (error) {
      console.error("Ошибка загрузки деталей пинов:", error);
    } finally {
      setLoadingPins(false);
    }
  };

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
          setLikesCount(board.rating ?? board.likes ?? FALLBACK_LIKES);
          
          // Извлекаем ID пинов из подборки
          const pinIds = Array.isArray(board.pins) 
            ? board.pins
                .map((pin: any) => pin.id || pin.pinId)
                .filter((id: string) => id) // Фильтруем пустые ID
            : [];
          
          // Если есть пины - загружаем их детали
          if (pinIds.length > 0) {
            await loadAllPinDetails(pinIds);
          } else {
            setCollectionPins([]);
          }
          
          return;
        }

        // 2. Если бэкенд не ответил, пробуем моки
        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          setLikesCount(mockCollection.likes ?? FALLBACK_LIKES);
          
          const mockPins = getCollectionPins(collectionId) || [];
          if (mockPins.length > 0) {
            // Для моков тоже можно загрузить детали, если есть ID
            const mockPinIds = mockPins
              .map((pin: any) => pin.id)
              .filter((id: string) => id);
            
            if (mockPinIds.length > 0) {
              await loadAllPinDetails(mockPinIds);
            } else {
              // Если нет ID, используем моковые данные
              const formattedPins = mockPins.map((pin: any) => ({
                ...pin,
                image: getPinImageUrl(pin),
                author: pin.author || "jane_anderson",
                authorAvatar: placeholder_1,
                description: pin.description || "",
                likes: pin.likes || 0,
                latitude: pin.latitude || null,
                longitude: pin.longitude || null
              }));
              setCollectionPins(formattedPins);
            }
          } else {
            setCollectionPins([]);
          }
        } else {
          setError(`Коллекция с ID ${collectionId} не найдена`);
        }
      } catch (e) {
        console.error("Ошибка загрузки коллекции:", e);
        
        // Фолбэк на моки при ошибке
        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          setLikesCount(mockCollection.likes ?? FALLBACK_LIKES);
          
          const mockPins = getCollectionPins(collectionId) || [];
          const formattedPins = mockPins.map((pin: any) => ({
            ...pin,
            image: getPinImageUrl(pin),
            author: pin.author || "jane_anderson",
            authorAvatar: placeholder_1,
            description: pin.description || "",
            likes: pin.likes || 0,
            latitude: pin.latitude || null,
            longitude: pin.longitude || null
          }));
          setCollectionPins(formattedPins);
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

  // Вспомогательная функция для получения URL изображения пина


  // Функция для получения полного URL изображения из деталей пина
  const getFullPinImageUrl = (fullPin: any) => {
    if (fullPin.images && fullPin.images[0] && fullPin.images[0].imageUrl) {
      return fullPin.images[0].imageUrl;
    }
    if (fullPin.imageUrl) {
      return fullPin.imageUrl;
    }
    if (fullPin.image) {
      return fullPin.image;
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
    return placeholder;
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

  // Обработчик клика по пину - открываем полную страницу
  const handlePinClick = (pinId: string) => {
    navigate(`/pin/${pinId}?from=collection/${collectionId}`);
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loading}>Загрузка коллекции...</div>
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
            {loadingPins && <span className={styles.loadingBadge}>Загрузка...</span>}
          </h3>

          <div className={styles.pinsWrapper}>
            {loadingPins ? (
              <div className={styles.loadingPins}>
                <p>Загружаем детали мест...</p>
              </div>
            ) : collectionPins.length === 0 ? (
              <div className={styles.emptyPins}>
                <p>В этой подборке пока нет мест</p>
              </div>
            ) : (
              <PinGrid
                pins={collectionPins}
                onPinClick={handlePinClick}
              />
            )}
          </div>

          <CommentSection comments={comments} title="Комментарии" />
        </div>

        {/* Правая колонка для карты */}
        <div className={styles.mapWrapperFixed}>
          {loadingPins ? (
            <div className={styles.loadingMap}>
              <p>Загружаем карту...</p>
            </div>
          ) : pinsForMap.length === 0 ? (
            <div className={styles.emptyMapPlaceholder}>
              <div className={styles.placeholderContent}>
                <p className={styles.placeholderText}>
                  Когда тут будут пины, мы покажем их на карте
                </p>
                <button 
                  className={styles.addPinButton}
                  onClick={() => navigate(`/pin/create?collectionId=${collectionId}`)}
                >
                  Добавить первое место
                </button>
              </div>
            </div>
          ) : (
            <MapShower
              readOnly
              onSelect={() => {}}
              initialCoords={mapCenterCoords as [number, number]}
              pins={pinsForMap}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionViewPage;