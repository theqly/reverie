import { useState } from "react";
import styles from "./EditProfileModal.module.css";

const EditProfileModal = ({ isOpen, onClose, onSave, initialData }) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialData.name);
  const [nickname, setNickname] = useState(initialData.nickname || "");
  const [description, setdescription] = useState(initialData.description);
  const [avatar, setAvatar] = useState(initialData.avatar);
  const [nickTag, setNickTag] = useState(initialData.nickTag);


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  const handleSave = () => {
    onSave({ name, nickname, description, avatar });
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
            value={nickTag}
            onChange={(e) => setNickTag(e.target.value)}
          />
          <div className={styles.counter}>{nickname.length} / 50</div>
        </label>

        {/* description */}
        <label className={styles.field}>
          <span>description</span>
          <textarea
            maxLength={250}
            value={description}
            onChange={(e) => setdescription(e.target.value)}
            className={styles.textarea}
          />
          <div className={styles.counter}>{description.length} / 250</div>
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
