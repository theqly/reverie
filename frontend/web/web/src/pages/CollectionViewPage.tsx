import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import styles from "./PinViewPage.module.css";
import placeholder_1 from "../assets/placeholder1.jpg";
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
        const board = await getBoardById(collectionId);

        if (board) {
          setCollection(board);
          setCollectionPins(Array.isArray(board.pins) ? board.pins : []);
          // Установка likesCount из данных коллекции (как в PinViewPage)
          setLikesCount(board.rating ?? board.likes ?? FALLBACK_LIKES);
          return;
        }

        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          setCollectionPins(getCollectionPins(collectionId) || []);
          setLikesCount(mockCollection.likes ?? FALLBACK_LIKES);
        } else {
          setError(`Коллекция с ID ${collectionId} не найдена`);
        }
      } catch (e) {
        console.error("Ошибка загрузки коллекции:", e);

        const mockCollection = getCollectionById(collectionId);
        if (mockCollection) {
          setCollection(mockCollection);
          setCollectionPins(getCollectionPins(collectionId) || []);
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
      // лайк
      try {
        const likedStatus = await isBoardLiked(collectionId);
        setLiked(likedStatus);
      } catch {}

      // букмарка
      try {
        const bookmarkedStatus = await isBoardBookmarked(collectionId);
        setBookmarked(bookmarkedStatus);
      } catch {}

      // количество лайков — переопределяем после загрузки коллекции
      try {
        const count = await countReactionsToBoard({ boardId: collectionId });
        // Универсальная обработка: поддерживаем число, строку, объект { count }
        let actualCount: number | null = null;

        if (typeof count === "number") {
          actualCount = count;
        } else if (typeof count === "string") {
          const parsed = Number(count);
          if (!isNaN(parsed)) actualCount = parsed;
        } else if (count && typeof count === "object" && "count" in count) {
          const nested = (count as any).count;
          if (typeof nested === "number") {
            actualCount = nested;
          } else if (typeof nested === "string") {
            const parsed = Number(nested);
            if (!isNaN(parsed)) actualCount = parsed;
          }
        }

        if (actualCount !== null && actualCount >= 0) {
          setLikesCount(actualCount);
        }
      } catch (err) {
        console.warn("Не удалось загрузить количество лайков:", err);
        // оставляем текущее значение (из коллекции или fallback)
      }
    };

    loadReactions();
  }, [collectionId]);

  /* ------------------ handlers ------------------ */
  const handleLike = async (nextLiked: boolean) => {
    setLiked(nextLiked);
    setLikesCount(prev => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)));

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
    navigate(-1);
  };

  /* ------------------ loading / error ------------------ */
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

  /* ------------------ render ------------------ */
  const comments = [
    {
      authorName: "jane_anderson",
      authorAvatar: placeholder_1,
      commentText: "Отличная подборка! Спасибо за рекомендации.",
      commentDate: "2 часа назад",
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn} />
            <h2>
              Подборка: <strong>{collection.name}</strong>
            </h2>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/collection/edit/${collectionId}`)}
            />
          </div>

          <div className={styles.pinCard}>
            <h3 className={styles.pinTitle}>{collection.name}</h3>
            <p className={styles.pinDescription}>
              {collection.description || "Без описания"}
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
      </div>
    </div>
  );
};

export default CollectionViewPage;