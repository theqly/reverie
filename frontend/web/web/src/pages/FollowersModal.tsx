import React, { useState } from "react";
import styles from "./FollowersModal.module.css";
import placeholder_10 from '../assets/placeholder10.jpg';


const FollowersModal = ({ isOpen, onClose, onFollowToggle }) => {
  if (!isOpen) return null;

  const [followers, setFollowers] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Follo=er ${i + 1}`,
      avatar: {placeholder_10},
      isFollowing: false
    }))
  );

  const handleToggle = (userId) => {
    setFollowers((prev) =>
      prev.map((f) =>
        f.id === userId ? { ...f, isFollowing: !f.isFollowing } : f
      )
    );

    // вызываем внешний обработчик (заглушка)
    onFollowToggle(userId);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Подписчики</h2>

        <div className={styles.list}>
          {followers.map((f) => (
            <div key={f.id} className={styles.row}>
              <img src={placeholder_10} className={styles.avatar} />

              <span>{f.name}</span>


              <button
                onClick={() => handleToggle(f.id)}
                className={`${styles.followBtn} ${
                  f.isFollowing ? styles.unfollow : styles.follow
                }`}
              >
                {f.isFollowing ? "Отписаться" : "Подписаться"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
