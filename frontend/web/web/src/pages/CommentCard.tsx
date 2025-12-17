import React from 'react';
import styles from './CommentCard.module.css'; // Скопируй сюда твои стили
import placeholder_1 from '../assets/placeholder1.jpg';
import { Link } from 'react-router-dom';

const CommentCard = ({ 
  authorName = "jane_anderson",
  authorAvatar = placeholder_1,
  commentText = "Это пример комментария. Здесь может быть длинный текст, и карточка будет автоматически расширяться.",
  commentDate = "2 часа назад"
}) => {
  return (
    <div className={styles.commentCard}>
      
      <div className={styles.commentAuthorWrapper}>
        <img
          src={authorAvatar}
          alt={`Аватар ${authorName}`}
          className={styles.commentAuthorAvatar}
        />
        <div className={styles.commentAuthorName}><Link to={`/profile`} className={styles.authorLink}> {authorName} </Link></div>
      </div>
      
      <div className={styles.commentText}>
        {commentText}
      </div>
      <div className={styles.commentDate}>{commentDate}</div>
    </div>
  );
};

export default CommentCard;