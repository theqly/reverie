import React, { useState } from 'react';
import styles from './CommentSection.module.css';
import CommentCard from './CommentCard';

interface Comment {
  id?: string;
  authorName: string;
  authorAvatar?: string;
  commentText: string;
  commentDate: string;
}

interface CommentSectionProps {
  comments?: Comment[];
  title?: string;
  onAddComment?: (message: string) => Promise<void>;
  loading?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments = [],
  title = "Комментарии",
  onAddComment,
  loading = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.commentWrapper}>
      <p>{title}</p>

      {/* Форма добавления комментария */}
      {onAddComment && (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            className={styles.commentInput}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className={styles.submitBtn}
          >
            {submitting ? '...' : 'Отправить'}
          </button>
        </form>
      )}

      <section className={styles.commentSection}>
        {loading ? (
          <p className={styles.noComments}>Загрузка комментариев...</p>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentCard
              key={comment.id || index}
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