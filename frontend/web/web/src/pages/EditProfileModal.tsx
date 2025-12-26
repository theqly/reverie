import { useState, useEffect, ChangeEvent } from "react";
import styles from "./EditProfileModal.module.css";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; nickname: string; bio: string; avatar: string }) => void;
  initialData: { name: string; nickname?: string; bio: string; avatar: string };
}

const EditProfileModal = ({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) => {
  const [name, setName] = useState(initialData.name);
  const [nickname, setNickname] = useState(initialData.nickname || "");
  const [bio, setBio] = useState(initialData.bio);
  const [avatar, setAvatar] = useState(initialData.avatar);

  // Синхронизируем с initialData при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setName(initialData.name);
      setNickname(initialData.nickname || "");
      setBio(initialData.bio);
      setAvatar(initialData.avatar);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  };

  const handleSave = () => {
    onSave({ name, nickname, bio, avatar });
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Редактировать профиль</h2>

        {/* АВАТАРКА */}
        <div className={styles.avatarBlock}>
          <img src={avatar} className={styles.avatarPreview} />

          <label className={styles.avatarButton}>
            Сменить аватарку
            <input 
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className={styles.fileInput}
            />
          </label>
        </div>

        {/* ИМЯ */}
        <label className={styles.field}>
          <span>Имя</span>
          <input 
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={styles.counter}>{name.length} / 50</div>
        </label>

        {/* НИКНЕЙМ */}
        <label className={styles.field}>
          <span>Никнейм</span>
          <input 
            maxLength={50}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <div className={styles.counter}>{nickname.length} / 50</div>
        </label>

        {/* BIO */}
        <label className={styles.field}>
          <span>Bio</span>
          <textarea
            maxLength={250}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.textarea}
          />
          <div className={styles.counter}>{bio.length} / 250</div>
        </label>

        <div className={styles.actions}>
          <button onClick={handleSave} className={styles.saveBtn}>Сохранить</button>
          <button onClick={onClose} className={styles.cancelBtn}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
