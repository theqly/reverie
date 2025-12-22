import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import MapPicker from "./MapPicker";
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
import { getCommentsByPin, addCommentToPin } from "../services/commentService";
import { useCurrentUserId } from "../context/AuthContext";
import { getCityFromCoordinates } from "../services/geoService";

const FALLBACK_LIKES = 226;

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams();
  const currentUserId = useCurrentUserId();

  const [pin, setPin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // реакции
  const [likesCount, setLikesCount] = useState<number>(FALLBACK_LIKES);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // комментарии
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // локация
  const [location, setLocation] = useState<string>('');

  /* ------------------ загрузка пина ------------------ */
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

          // Получаем город из координат
          if (backendPin.latitude && backendPin.longitude) {
            getCityFromCoordinates(backendPin.latitude, backendPin.longitude)
              .then(city => setLocation(city))
              .catch(() => setLocation(''));
          }
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

  /* ------------------ загрузка реакций ------------------ */
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

  /* ------------------ загрузка комментариев ------------------ */
  useEffect(() => {
    if (!pinId) return;

    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const backendComments = await getCommentsByPin({ pinId, limit: 50 });
        if (backendComments && backendComments.length > 0) {
          // Преобразуем формат комментариев
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
  }, [pinId]);

  /* ------------------ handlers ------------------ */
  const handleLike = async (nextLiked: boolean) => {
    setLiked(nextLiked); // optimistic UI
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(prev - 1, 0));

    try {
      // togge на сервере: если есть лайк — удалит, если нет — добавит
      await reactToPin({ pinId, userId: currentUserId });
    } catch (error) {
      console.error("Failed to toggle pin reaction", error);
    }
  };

  const handleBookmark = async (nextBookmarked: boolean) => {
    setBookmarked(nextBookmarked); // optimistic UI
    try {
      await toggleBookmarkToPin(pinId!, currentUserId); // toggle на сервере
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  };

  const handleBack = () => navigate(-1);

  const handleAddComment = async (message: string) => {
    if (!pinId) return;
    try {
      const newComment = await addCommentToPin({
        pinId,
        ownerId: currentUserId,
        message,
      });
      if (newComment) {
        // Добавляем новый комментарий в начало списка
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

  /* ------------------ loading / error ------------------ */
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
        <p>{error}</p>
        <button onClick={() => navigate("/feed")} className={styles.backButton}>
          Вернуться на главную
        </button>
      </div>
    </div>
  );

  /* ------------------ render ------------------ */
  // Моковые комментарии как fallback
  const fallbackComments = comments.length === 0 ? [
    {
      authorName: pin.author || "jane_anderson",
      authorAvatar: placeholder_1,
      commentText: "Отличное фото! Очень красивое место.",
      commentDate: "2 часа назад",
    },
  ] : comments;

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.h_container}>
            <button onClick={handleBack} className={styles.back_btn} />
            <h2>
              Пин от <Link to={pin.owner?.nickTag ? `/profile/${pin.owner.nickTag}` : '/profile'} className={styles.authorA}>@{pin.owner?.nickname || pin.author || 'Unknown'}</Link>
            </h2>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/pin/edit/${pinId}`)}
            />
          </div>

          <div className={styles.pinCardWrapper}>
            <div className={styles.pinCard}>
              <img src={pin.images?.[0]?.imageUrl || pin.image || placeholder_1} alt={pin.name || pin.title} className={styles.img1} />
              <h3 className={styles.pinTitle}>{pin.name || pin.title}</h3>
              <p className={styles.collectionLocation}>{location || pin.location}</p>
              <p className={styles.pinDescription}>{pin.description}</p>

              <ReactionBlock
                initialLikes={likesCount}
                initialLiked={liked}
                initialBookmarked={bookmarked}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            </div>

            <CommentSection
              comments={fallbackComments}
              title="Комментарии"
              loading={commentsLoading}
              onAddComment={handleAddComment}
            />
          </div>
        </div>

        <div className={styles.mapWrapperFixed}>
          {pin.latitude != null && pin.longitude != null && (
            <MapPicker
              readOnly
              onSelect={() => {}}
              initialCoords={[pin.latitude, pin.longitude]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PinViewPage;
