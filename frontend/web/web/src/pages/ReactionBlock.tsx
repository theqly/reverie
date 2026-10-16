
import styles from './ReactionBlock.module.css';

interface ReactionBlockProps {
  initialLikes?: number;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
  onLike?: (nextLiked: boolean) => void | Promise<void>;
  onBookmark?: (nextBookmarked: boolean) => void | Promise<void>;
  disabled?: boolean;
}

const ReactionBlock = ({
  initialLikes = 0,
  initialLiked = false,
  initialBookmarked = false,
  onLike,
  onBookmark,
  disabled = false,
}: ReactionBlockProps) => {
  return (
    <div className={styles.reactionBlock}>
      <div className={styles.likesWrapper}>
        <button
          type="button"
          disabled={disabled}
          className={`${styles.reactionButton} ${styles.likeButton} ${initialLiked ? styles.active : ''}`}
          onClick={() => void onLike?.(!initialLiked)}
          aria-label={initialLiked ? 'Убрать лайк' : 'Поставить лайк'}
          aria-pressed={initialLiked}
        >
          <svg
            className={styles.heartIcon}
            viewBox="0 0 24 24"
            fill={initialLiked ? '#ff4757' : 'none'}
            stroke={initialLiked ? '#ff4757' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <p className={styles.likesCount}>{initialLikes}</p>
      </div>

      <div className={styles.bmWrapper}>
        <button
          type="button"
          disabled={disabled}
          className={`${styles.reactionButton} ${styles.bookmarkButton} ${initialBookmarked ? styles.active : ''}`}
          onClick={() => void onBookmark?.(!initialBookmarked)}
          aria-label={initialBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
          aria-pressed={initialBookmarked}
        >
          <svg
            className={styles.bookmarkIcon}
            viewBox="0 0 24 24"
            fill={initialBookmarked ? '#4a90e2' : 'none'}
            stroke={initialBookmarked ? '#4a90e2' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReactionBlock;
