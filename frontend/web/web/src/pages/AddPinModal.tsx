import React from "react";
import styles from "./AddPinModal.module.css";
import { useNavigate } from 'react-router-dom';


interface AddPinModalProps {
  onClose: () => void;
}

const AddPinModal: React.FC<AddPinModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // ← предотвращает закрытие при клике внутри модалки
      >
        <div className={styles.header_container}>
            <h2 className={styles.title}>Add pin to collection</h2>
            <button className={styles.closeBtn} onClick={onClose}></button>
        </div>

        <button className={`${styles.option} ${styles.first}`}>Create a new pin</button>
        <button className={styles.option} onClick={() => navigate('/likes/feed')}>Add from My pins</button>
        <button className={styles.option}>Add from Likes</button>
        <button className={styles.option}>Add from Bookmarks</button>
        <button className={styles.option}>Add by link</button>

      </div>
    </div>
  );
};

export default AddPinModal;
