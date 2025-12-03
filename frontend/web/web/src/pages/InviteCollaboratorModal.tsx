import React, { useState } from "react";
import styles from "./InviteCollaboratorModal.module.css";
import placeholder from '../assets/placeholder.jpg';

interface InviteCollaboratorModalProps {
  onClose: () => void;
  onAddCollaborator: (name: string) => void;
  existingCollaborators: string[];   // ← добавили
}


const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  onClose,
  onAddCollaborator,
  existingCollaborators
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [foundUser, setFoundUser] = useState<{name: string, avatar: string} | null>(null);

  // Заглушка: 100 подписчиков
  const followers = Array.from({ length: 100 }, (_, i) => `Follower ${i + 1}`);

  const handleAddRandom = () => {
    const name = `Collaborator ${Math.floor(Math.random() * 1000)}`;
    onAddCollaborator(name);
    onClose();
  };

  // --- Search by nickname ---
  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setIsFollowersOpen(false);
    setFoundUser(null);
    setNickname("");
  };
  

  const handleFindUser = () => {
    if (nickname.trim()) {
      // Заглушка: создаём объект пользователя с аватаркой
      setFoundUser({ name: nickname, avatar: placeholder });
    }
  };
  

  const handleInviteFoundUser = () => {
    if (foundUser) {
      onAddCollaborator(foundUser.name);
      onClose();
    }
  };

  // --- Pick from followers ---
  const handleFollowersClick = () => {
    setIsFollowersOpen(true);
    setIsSearchOpen(false);
    setNickname("");
    setFoundUser(null);
  };

  const handleSelectFollower = (name: string) => {
    onAddCollaborator(name);
    onClose();
  };

  // Фильтрация подписчиков по введённому тексту
  const filteredFollowers = followers.filter(f =>
    f.toLowerCase().includes(nickname.toLowerCase())
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header_container}>
          <h2 className={styles.title}>
            {isFollowersOpen
              ? "Подписчики"
              : isSearchOpen
              ? "Найти по нику"
              : "Пригласить соавтора"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}></button>
        </div>

        {/* --- Основное меню --- */}
        {!isSearchOpen && !isFollowersOpen && (
          <>
            <button className={`${styles.option} ${styles.first}`} onClick={handleFollowersClick}>
              Выбрать из подписчиков
            </button>

            <button className={styles.option} onClick={handleSearchClick}>
              Найти по нику
            </button>

            <button className={styles.option} onClick={handleAddRandom}>
              Пригласить в Reverie
            </button>
          </>
        )}

        {/* --- Поиск по нику --- */}
        {isSearchOpen && (
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Enter nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFindUser(); // вызываем поиск при Enter
                }
              }}
              className={styles.searchInput}
            />

            <button className={styles.searchButton} onClick={handleFindUser}>
              Найти
            </button>

            {foundUser && (
              <div className={styles.foundUser}>
                <img src={foundUser.avatar} alt="avatar" className={styles.avatar} />
                <span>{foundUser.name}</span>

                {existingCollaborators.includes(foundUser.name) ? (
                  <button className={styles.inviteButton} disabled>
                    Уже добавлен
                  </button>
                ) : (
                  <button className={styles.inviteButton} onClick={handleInviteFoundUser}>
                    Добавить
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* --- Список подписчиков --- */}
        {isFollowersOpen && (
          <div className={styles.followersContainer}>
            <input
              type="text"
              placeholder="Поиск подписчиков"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.followersList}>
              {filteredFollowers.map((name, idx) => (
                <div key={idx} className={styles.foundUser}>
                  <img src={placeholder} alt="avatar" className={styles.avatar} />
                  <span>{name}</span>

                  {existingCollaborators.includes(name) ? (
                    <button className={styles.inviteButton} disabled>
                      Уже добавлен
                    </button>
                  ) : (
                    <button className={styles.inviteButton} onClick={() => handleSelectFollower(name)}>
                      Добавить
                    </button>
                  )}
                </div>
              ))}

              {filteredFollowers.length === 0 && <div className={styles.noResults}>Ничего не найдено</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteCollaboratorModal;
