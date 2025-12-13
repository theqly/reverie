import React, { useState } from 'react';
import styles from './ReactionBlock.module.css';

const ReactionBlock = ({ 
  initialLikes = 226,
  initialLiked = false,
  initialBookmarked = false,
  onLike,
  onBookmark
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (onLike) onLike(newLikedState);
  };

  const handleBookmark = () => {
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    if (onBookmark) onBookmark(newBookmarkedState);
  };

  return (
    <div className={styles.reactionBlock}>
      {/* Лайки */}
      <div className={styles.likesWrapper}>
        <button 
          className={`${styles.reactionButton} ${styles.likeButton} ${isLiked ? styles.active : ''}`}
          onClick={handleLike}
          aria-label={isLiked ? "Убрать лайк" : "Поставить лайк"}
          aria-pressed={isLiked}
        >
          <svg 
            className={styles.heartIcon}
            viewBox="0 0 24 24"
            fill={isLiked ? "#ff4757" : "none"}
            stroke={isLiked ? "#ff4757" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <p className={styles.likesCount}>{likesCount}</p>
      </div>

      {/* Закладки */}
      <div className={styles.bmWrapper}>
        <button 
          className={`${styles.reactionButton} ${styles.bookmarkButton} ${isBookmarked ? styles.active : ''}`}
          onClick={handleBookmark}
          aria-label={isBookmarked ? "Убрать из закладок" : "Добавить в закладки"}
          aria-pressed={isBookmarked}
        >
          <svg 
            className={styles.bookmarkIcon}
            viewBox="0 0 24 24"
            fill={isBookmarked ? "#4a90e2" : "none"}
            stroke={isBookmarked ? "#4a90e2" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReactionBlock;