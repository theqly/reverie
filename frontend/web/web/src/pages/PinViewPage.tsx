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

const FALLBACK_LIKES = 226;
const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

const PinViewPage = () => {
  const navigate = useNavigate();
  const { pinId } = useParams();

  const [pin, setPin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState<number>(FALLBACK_LIKES);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

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

  const handleBack = () => navigate(-1);

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

  const comments = [
    {
      authorName: "jane_anderson",
      authorAvatar: placeholder_1,
      commentText: "Отличное фото! Очень красивое место.",
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
              Пин от <Link to="/profile" className={styles.authorA}>@jane_anderson</Link>
            </h2>
            <button
              className={styles.settingsBtn}
              onClick={() => navigate(`/pin/edit/${pinId}`)}
            />
          </div>

          <div className={styles.pinCardWrapper}>
            <div className={styles.pinCard}>
              <img src={placeholder_1} alt={pin.name} className={styles.img1} />
              <h3 className={styles.pinTitle}>{pin.name}</h3>
              <p className={styles.collectionLocation}>
                Широта: {pin.latitude}, Долгота: {pin.longitude}
              </p>
              <p className={styles.pinDescription}>{pin.description || ""}</p>

              <ReactionBlock
                initialLikes={likesCount}
                initialLiked={liked}
                initialBookmarked={bookmarked}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            </div>

            <CommentSection comments={comments} title="Комментарии" />
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
