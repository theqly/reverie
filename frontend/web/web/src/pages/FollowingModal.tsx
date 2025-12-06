import React, { useState } from "react";
import styles from "./FollowersModal.module.css";
import placeholder from "../assets/placeholder.jpg";

interface FollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FollowingModal: React.FC<FollowingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState("");

  // Состояние подписок (локально)
  const [following, setFollowing] = useState(
    Array.from({ length: 70 }, (_, i) => ({
      id: i + 1,
      name: `Following ${i + 1}`,
      avatar: placeholder,
      isFollowing: true,
    }))
  );

  const filtered = following.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---- ОБРАБОТЧИК ДЛЯ СЕРВЕРА ----
  const toggleFollow = async (id: number) => {
    console.log("Отправка на сервер...", id);

    // имитация API запроса
    await new Promise((res) => setTimeout(res, 100));

    console.log("Готово. Сервер обработал запрос.");

    // локально меняем состояние
    setFollowing((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isFollowing: !u.isFollowing } : u
      )
    );
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
              <img src={user.avatar} className={styles.avatar} />

              <span>{user.name}</span>

              <button
                className={`${styles.followBtn} ${
                  user.isFollowing ? styles.unfollow : styles.follow
                }`}
                onClick={() => toggleFollow(user.id)}
              >
                {user.isFollowing ? "Отписаться" : "Подписаться"}
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.noResults}>Ничего не найдено</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;
