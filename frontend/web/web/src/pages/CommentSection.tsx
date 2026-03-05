import React, { useState } from 'react';
import styles from './CommentSection.module.css';
import CommentCard from './CommentCard';

type Comment = {
  authorName: string;
  authorAvatar?: string;
  commentText: string;
  commentDate: string;
};

type Props = {
  comments?: Comment[];
  title?: string;
};

const CommentSection: React.FC<Props> = ({
  comments = [],
  title = 'Комментарии',
}) => {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      authorName: 'Вы',
      authorAvatar: '',
      commentText: commentText.trim(),
      commentDate: new Date().toLocaleString(),
    };

    setLocalComments(prev => [newComment, ...prev]);
    setCommentText('');
  };

  return (
    <div className={styles.commentWrapper}>
      <p>{title}</p>

      {/* Форма добавления комментария */}
      <div className={styles.commentForm}>
        <textarea
          className={styles.commentInput}
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Оставьте комментарий…"
        />

        <button
          className={styles.commentButton}
          onClick={handleAddComment}
        >
          Комментировать
        </button>
      </div>

      <section className={styles.commentSection}>
        {localComments.length > 0 ? (
          localComments.map((comment, index) => (
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
