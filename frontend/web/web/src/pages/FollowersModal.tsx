import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FollowersModal.module.css";
import placeholder_10 from '../assets/placeholder10.jpg';
import { followUser, unfollowUser } from '../services/followService';
import { useCurrentUserId } from '../context/AuthContext';

interface Follower {
  id: string;
  nickname: string;
  nickTag?: string;
  profilePicture?: string | null;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  followers: Follower[];
  currentUserFollowing?: string[]; // IDs пользователей, на которых подписан текущий пользователь
  onFollowChange?: (userId: string, isNowFollowing: boolean) => void; // Колбэк при изменении подписки
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  followers = [],
  currentUserFollowing = [],
  onFollowChange
}) => {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();

  // Локальное состояние для отслеживания подписок
  const [followingState, setFollowingState] = useState<Set<string>>(
    new Set(currentUserFollowing)
  );
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = followers.filter((f) =>
    f.nickname.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFollow = async (userId: string) => {
    if (userId === currentUserId) return; // Нельзя подписаться на себя

    try {
      const isCurrentlyFollowing = followingState.has(userId);

      if (isCurrentlyFollowing) {
        await unfollowUser(userId, currentUserId);
        setFollowingState(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        onFollowChange?.(userId, false);
      } else {
        await followUser(userId, currentUserId);
        setFollowingState(prev => new Set(prev).add(userId));
        onFollowChange?.(userId, true);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };

  const handleUserClick = (nickTag?: string) => {
    if (nickTag) {
      onClose();
      navigate(`/profile/${nickTag}`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header_container}>
          <h2 className={styles.title}>Подписчики</h2>
          <button className={styles.closeBtn} onClick={onClose}></button>
        </div>

        <input
          type="text"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.list}>
          {filtered.map((f) => (
            <div key={f.id} className={styles.row}>
              <img
                src={f.profilePicture || placeholder_10}
                className={styles.avatar}
                onClick={() => handleUserClick(f.nickTag)}
                style={{ cursor: 'pointer' }}
              />

              <span
                onClick={() => handleUserClick(f.nickTag)}
                style={{ cursor: 'pointer' }}
              >
                {f.nickname}
              </span>

              {f.id !== currentUserId && (
                <button
                  onClick={() => handleToggleFollow(f.id)}
                  className={`${styles.followBtn} ${
                    followingState.has(f.id) ? styles.unfollow : styles.follow
                  }`}
                >
                  {followingState.has(f.id) ? "Отписаться" : "Подписаться"}
                </button>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.noResults}>
              {followers.length === 0 ? "Нет подписчиков" : "Ничего не найдено"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
