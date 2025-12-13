import React from 'react';
import styles from './CommentSection.module.css'; // Скопируй сюда твои стили
import CommentCard from './CommentCard';

const CommentSection = ({ 
  comments = [], // Массив комментариев
  title = "Комментарии"
}) => {
  return (
    <div className={styles.commentWrapper}>
      <p>{title}</p>
      <section className={styles.commentSection}>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentCard
              key={index}
              authorName={comment.authorName}
              authorAvatar={comment.authorAvatar}
              commentText={comment.commentText}
              commentDate={comment.commentDate}
            />
          ))
        ) : (
          <p className={styles.noComments}>Пока нет комментариев</p>
        )}
      </section>
    </div>
  );
};

export default CommentSection;