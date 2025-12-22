import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FollowersModal.module.css";
import placeholder from "../assets/placeholder.jpg";
import { followUser, unfollowUser } from '../services/followService';
import { useCurrentUserId } from '../context/AuthContext';

interface FollowingUser {
  id: string;
  nickname: string;
  nickTag?: string;
  profilePicture?: string | null;
}

interface FollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  following: FollowingUser[];
  onUnfollow?: (userId: string) => void;
  isOwnProfile?: boolean;
  currentUserFollowing?: string[]; // IDs пользователей, на которых подписан текущий пользователь
  onFollowChange?: (userId: string, isNowFollowing: boolean) => void; // Колбэк при изменении подписки
}

const FollowingModal: React.FC<FollowingModalProps> = ({
  isOpen,
  onClose,
  following = [],
  onUnfollow,
  isOwnProfile = false,
  currentUserFollowing = [],
  onFollowChange
}) => {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();

  const [search, setSearch] = useState("");
  // Локальное состояние для отслеживания подписок/отписок
  const [followingState, setFollowingState] = useState<Set<string>>(
    new Set(currentUserFollowing)
  );

  // Обновляем состояние при изменении props
  React.useEffect(() => {
    setFollowingState(new Set(currentUserFollowing));
  }, [currentUserFollowing]);

  if (!isOpen) return null;

  const filtered = following.filter((f) =>
    f.nickname.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFollow = async (userId: string) => {
    if (userId === currentUserId) return;

    try {
      const isCurrentlyFollowing = followingState.has(userId);

      if (isCurrentlyFollowing) {
        await unfollowUser(userId, currentUserId);
        setFollowingState(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        if (isOwnProfile) {
          onUnfollow?.(userId);
        }
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
          <h2 className={styles.title}>Подписки</h2>
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
          {filtered.map((user) => (
            <div key={user.id} className={styles.row}>
              <img
                src={user.profilePicture || placeholder}
                className={styles.avatar}
                onClick={() => handleUserClick(user.nickTag)}
                style={{ cursor: 'pointer' }}
              />

              <span
                onClick={() => handleUserClick(user.nickTag)}
                style={{ cursor: 'pointer' }}
              >
                {user.nickname}
              </span>

              {user.id !== currentUserId && (
                <button
                  onClick={() => handleToggleFollow(user.id)}
                  className={`${styles.followBtn} ${
                    followingState.has(user.id) ? styles.unfollow : styles.follow
                  }`}
                >
                  {followingState.has(user.id) ? "Отписаться" : "Подписаться"}
                </button>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.noResults}>
              {following.length === 0 ? "Нет подписок" : "Ничего не найдено"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;
