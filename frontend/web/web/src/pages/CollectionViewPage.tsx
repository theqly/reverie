import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import styles from "./PinViewPage.module.css";
import placeholder_1 from "../assets/placeholder1.jpg";
import placeholder from "../assets/placeholder3.jpg";
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
          const pins = Array.isArray(board.pins) 
            ? board.pins.map(pin => ({
                ...pin,
                id: pin.id || pin.pinId,
                image: getPinImageUrl(pin),
                author: pin.author || "jane_anderson",
                authorAvatar: placeholder_1,
                description: pin.description || "",
                likes: pin.likes || 0,
              }))
            : [];
            
          setCollectionPins(pins);
          setLikesCount(board.rating ?? board.likes ?? FALLBACK_LIKES);
          return;
        }

        // 2. Фолбэк на моки
        console.log("Используем моки для коллекции");
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
          }));
          
          setCollectionPins(formattedPins);
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
          }));
          
          setCollectionPins(formattedPins);
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
  const getCollectionImageUrl = () => {
    if (collection?.coverImageUrl) {
      return collection.coverImageUrl;
    }
    if (collection?.image) {
      return collection.image;
    }
    if (collection?.images && collection.images[0] && collection.images[0].imageUrl) {
      return collection.images[0].imageUrl;
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
              className={styles.collectionImage}
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

        {/* Правая колонка для карты (если нужно будет добавить) */}
        {/* <div className={styles.mapWrapperFixed}></div> */}
      </div>
    </div>
  );
};

export default CollectionViewPage;