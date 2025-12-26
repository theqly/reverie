import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import styles from "./PinViewPage.module.css";
import placeholder_1 from "../assets/placeholder1.jpg";
import CommentSection from "./CommentSection";
import ReactionBlock from "./ReactionBlock";
import PinGrid from "./PinGrid";
import MapViewer from "./MapViewer";
import { getCityFromCoordinates } from "../services/geoService";

// моки
import { getCollectionById, getCollectionPins } from "../utils/mockData";

// backend
import { getPinById as getBoardById, addPinToBoard } from "../services/collectionsService";
import { getPinsByUser } from "../services/profileService";

// реакции
import { countReactionsToBoard, reactToBoard } from "../services/reactionsService";
import { useToast } from "./ToastProvider";
import { isBoardLiked, isBoardBookmarked } from "../services/collectionsService";
import { toggleBookmarkToBoard } from "../services/bookmarksService";
import { getCommentsByBoard, addCommentToBoard } from "../services/commentService";
import { useCurrentUserId } from "../context/AuthContext";

const FALLBACK_LIKES = 0;
const LIKE_REACTION_ID = "8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f";

// Интерфейс для пина пользователя
interface UserPin {
  id: string;
  name: string;
  imageUrl?: string;
}

const CollectionViewPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const currentUserId = useCurrentUserId();
  const { showToast } = useToast();

  const [collection, setCollection] = useState<any>(null);
  const [collectionPins, setCollectionPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState<number>(FALLBACK_LIKES);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // комментарии
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // состояния для модального окна добавления пина
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [userPins, setUserPins] = useState<UserPin[]>([]);
  const [loadingUserPins, setLoadingUserPins] = useState(false);
  const [errorUserPins, setErrorUserPins] = useState<string | null>(null);

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

          // Трансформируем пины для PinGridItem - СНАЧАЛА без локаций (мгновенно)
          const rawPins = Array.isArray(board.pins) ? board.pins : [];
          const initialPins = rawPins.map((pin: any) => {
            // Сортируем изображения по orderNumber чтобы взять первое
            const sortedImages = [...(pin.images || [])].sort(
              (a: any, b: any) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
            );
            return {
              id: pin.id,
              title: pin.name,
              image: sortedImages[0]?.imageUrl || placeholder_1,
              location: '',
              author: pin.owner?.nickname || 'Unknown',
              authorAvatar: pin.owner?.profilePicture || placeholder_1,
              latitude: pin.latitude,
              longitude: pin.longitude,
              name: pin.name,
            };
          });

          setCollectionPins(initialPins);
          setLikesCount((board as any).rating ?? (board as any).likes ?? board.likes_count ?? FALLBACK_LIKES);
          setLoading(false);

          // Затем фоном подгружаем локации
          for (const pin of initialPins) {
            if (pin.latitude && pin.longitude) {
              getCityFromCoordinates(pin.latitude, pin.longitude).then(location => {
                setCollectionPins(prev => prev.map(p =>
                  p.id === pin.id ? { ...p, location } : p
                ));
              });
            }
          }
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

  /* ------------------ загрузка комментариев ------------------ */
  useEffect(() => {
    if (!collectionId) return;

    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const backendComments = await getCommentsByBoard({ boardId: collectionId, limit: 50 });
        if (backendComments && backendComments.length > 0) {
          const formattedComments = backendComments.map((c: any) => ({
            id: c.id,
            authorName: c.owner?.nickname || 'Unknown',
            authorAvatar: c.owner?.profilePicture || placeholder_1,
            commentText: c.message,
            commentDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ru-RU') : '',
          }));
          setComments(formattedComments);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [collectionId]);

  /* ------------------ handlers ------------------ */
  const handleAddComment = async (message: string) => {
    if (!collectionId) return;
    try {
      const newComment = await addCommentToBoard({
        boardId: collectionId,
        userId: currentUserId,
        message,
      });
      if (newComment) {
        setComments(prev => [{
          id: newComment.id,
          authorName: newComment.owner?.nickname || 'You',
          authorAvatar: newComment.owner?.profilePicture || placeholder_1,
          commentText: newComment.message,
          commentDate: 'Только что',
        }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const handleLike = async (nextLiked: boolean) => {
    setLiked(nextLiked);
    setLikesCount(prev => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)));

    try {
      await reactToBoard({
        boardId: collectionId!,
        reactionId: LIKE_REACTION_ID,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("Failed to toggle board reaction", error);
    }
  };

  const handleBookmark = async (nextBookmarked: boolean) => {
    setBookmarked(nextBookmarked);
    try {
      await toggleBookmarkToBoard({ boardId: collectionId!, userId: currentUserId });
    } catch (error) {
      console.error("Failed to toggle board bookmark", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  /* ------------------ загрузка пинов пользователя для модалки ------------------ */
  const loadUserPins = async () => {
    if (!currentUserId) {
      setErrorUserPins('Необходимо авторизоваться');
      return;
    }

    setLoadingUserPins(true);
    setErrorUserPins(null);

    try {
      const response = await getPinsByUser({
        userId: currentUserId,
        limit: 50,
        offset: 0,
      });

      if (response && response.length > 0) {
        // Фильтруем пины, которые уже есть в подборке
        const existingPinIds = new Set(collectionPins.map(p => p.id));
        const availablePins: UserPin[] = response
          .filter((pin: any) => !existingPinIds.has(pin.id))
          .map((pin: any) => ({
            id: pin.id,
            name: pin.name,
            imageUrl: pin.images?.[0]?.imageUrl || placeholder_1,
          }));
        setUserPins(availablePins);
      } else {
        setUserPins([]);
      }
    } catch (err) {
      console.error('[CollectionViewPage] loadUserPins error:', err);
      setErrorUserPins('Не удалось загрузить ваши пины');
      setUserPins([]);
    } finally {
      setLoadingUserPins(false);
    }
  };

  // Загружаем пины пользователя при открытии модалки
  useEffect(() => {
    if (showAddPinModal) {
      loadUserPins();
    }
  }, [showAddPinModal]);

  const handleOpenAddPinModal = () => {
    setShowAddPinModal(true);
  };

  const handleCloseAddPinModal = () => {
    setShowAddPinModal(false);
    setErrorUserPins(null);
  };

  const handleSelectPinToAdd = async (pinId: string, pinName: string) => {
    if (!collectionId) return;

    try {
      const result = await addPinToBoard(pinId, collectionId);

      if (result) {
        showToast(`Пин "${pinName}" добавлен в подборку`);

        // Добавляем пин в локальный список
        const addedPin = userPins.find(p => p.id === pinId);
        if (addedPin) {
          setCollectionPins(prev => [...prev, {
            id: addedPin.id,
            title: addedPin.name,
            name: addedPin.name,
            image: addedPin.imageUrl || placeholder_1,
            location: '',
            author: 'You',
            authorAvatar: placeholder_1,
          }]);
          // Убираем из списка доступных пинов
          setUserPins(prev => prev.filter(p => p.id !== pinId));
        }

        handleCloseAddPinModal();
      } else {
        showToast('Не удалось добавить пин', true);
      }
    } catch (error) {
      console.error('[handleSelectPinToAdd] Error:', error);
      showToast('Ошибка при добавлении пина', true);
    }
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
  // Моковые комментарии как fallback
  const displayComments = comments.length === 0 ? [
    {
      authorName: "jane_anderson",
      authorAvatar: placeholder_1,
      commentText: "Отличная подборка! Спасибо за рекомендации.",
      commentDate: "2 часа назад",
    },
  ] : comments;

  // Пины с координатами для карты
  const pinsWithCoords = collectionPins.filter(p => p.latitude && p.longitude);

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
              isOwnContent={currentUserId !== null && (collection?.ownerId === currentUserId || collection?.authorId === currentUserId)}
            />
          </div>

          <div className={styles.pinsTitleRow}>
            <h3 className={styles.pinsTitle}>
              Места в подборке ({collectionPins.length})
            </h3>
            <button
              className={styles.addPinBtn}
              onClick={handleOpenAddPinModal}
            >
              + Добавить пин
            </button>
          </div>

          <div className={styles.pinsWrapper}>
            <PinGrid
              pins={collectionPins}
              onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
            />
          </div>

          <CommentSection
            comments={displayComments}
            title="Комментарии"
            loading={commentsLoading}
            onAddComment={handleAddComment}
          />
        </div>

        {/* Карта справа — как у пина */}
        {pinsWithCoords.length > 0 && (
          <div className={styles.mapWrapperFixed}>
            <MapViewer
              pins={pinsWithCoords}
              onPinClick={(pinId) => navigate(`/pin/${pinId}`)}
              width="100%"
              height="100%"
            />
          </div>
        )}
      </div>

      {/* Модальное окно для добавления пина в подборку */}
      {showAddPinModal && (
        <div className={styles.modalOverlay} onClick={handleCloseAddPinModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Выберите пин для добавления</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={handleCloseAddPinModal}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {loadingUserPins ? (
                <div className={styles.modalLoading}>Загрузка ваших пинов...</div>
              ) : errorUserPins ? (
                <div className={styles.modalError}>
                  <p>{errorUserPins}</p>
                  <button
                    onClick={loadUserPins}
                    className={styles.retryButton}
                  >
                    Повторить попытку
                  </button>
                </div>
              ) : userPins.length === 0 ? (
                <div className={styles.modalEmpty}>
                  <p>Нет доступных пинов для добавления</p>
                  <button
                    onClick={() => {
                      handleCloseAddPinModal();
                      navigate('/pin/create');
                    }}
                    className={styles.createCollectionButton}
                  >
                    Создать новый пин
                  </button>
                </div>
              ) : (
                <ul className={styles.collectionsList}>
                  {userPins.map((pin) => (
                    <li
                      key={pin.id}
                      className={styles.collectionItem}
                      onClick={() => handleSelectPinToAdd(pin.id, pin.name)}
                    >
                      <img
                        src={pin.imageUrl || placeholder_1}
                        alt={pin.name}
                        className={styles.pinThumbnail}
                      />
                      <div className={styles.collectionInfo}>
                        <span className={styles.collectionName}>{pin.name}</span>
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

export default CollectionViewPage;